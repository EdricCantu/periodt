class Proc extends AudioWorkletProcessor{
  state = [0,0];
  block = [];
  blockSize = 128*8;//change second term only
  process(inputs){
    const input = inputs?.[0]?.[0];
    if (!input) return true;
    if(!this.state[0]){//[0,...]
      this.block.push(...input);
      if(this.block.length === this.blockSize){
        const x = this.processGoertzel(this.hannify(this.block));
        this.block = [];
        return x;
      }
      return true;
    }else{//[1,...]
      processClick(input);
      return true;
    }
  }
  processGoertzel(block){
    const snrgood = this.isGoodSNR(block);
    if(!this.state[1]){//blackened//[0,0]
      if(snrgood){//move to yellow
        this.state = [0, 1, currentTime];
        this.port.postMessage([1]);
      }else{}//still black
    }else{//yellowed//[0,1,...]
      if(snrgood){//not continuous, fail
        this.state = [0,0];
        this.port.postMessage([3]);
      }else if(currentTime - this.state[2] > 4){//still continuing, pass if time reached
        this.port.postMessage([2]);
        return false;
      }else{}//continuing, standby if time not reached
    }
    return true;
  }
  hannify(samples){
    var i = 0;
    while(i < samples.length){
      if(true){
        samples[i] *= 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (samples.length - 1));
      }else{
        samples[i] *= 1;
      }
      i++;
    }
    return samples;
  }
  isGoodSNR(block){//signal to noise ratio
    if(!this.coa){
      this.coa = this.calcCoeff(750, this.blockSize);
      this.cob = this.calcCoeff(800, this.blockSize);
      this.coc = this.calcCoeff(850, this.blockSize);
    }
    const ga = this.goertzel(block, this.coa);
    const gb = this.goertzel(block, this.cob);
    const gc = this.goertzel(block, this.coc);
    var gz = Math.max(ga,gc);
    gz *= 3;//noise threshold
    this.port.postMessage([0, gb, gz]);
    return gb > gz;
  }
  calcCoeff(freq){
    const a = this.blockSize * freq / sampleRate;
    const b = (2 * Math.PI * a) / this.blockSize;
    return 2 * Math.cos(b);
  }
  goertzel(samples, coeff){
    var prev1 = 0;
    var prev2 = 0;
    for(const sample of samples){
      const c = sample + coeff * prev1 - prev2;
      prev2 = prev1;
      prev1 = c;
    }
    return prev2**2  +  prev1**2  -  coeff*prev1*prev2;
  }
}

registerProcessor("processor", Proc);
