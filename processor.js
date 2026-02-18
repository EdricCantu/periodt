class Proc extends AudioWorkletProcessor{
  state = [0,0];
  process(inputs){
    const input = inputs[0];
    if (!input) return true;
    if(!this.state[0]){//[0,...]
      const snrgood = this.isGoodSNR(input);
      if(!this.state[1]){//blackened//[0,0]
        if(snrgood){//move to yellow
          this.state = [0, 1, currentTime];
          this.port.postMessage(1);
        }else{}//still black
      }else{//yellowed//[0,1,...]
        if(snrgood){//not continuous, fail
          this.state = [0,0];
          this.port.postMessage(3);
        }else if(currentTime - this.state[2] > 4){//still continuing, pass if time reached
          this.port.postMessage(2);
          return false;
        }else{}//continuing, standby if time not reached
      }
    }else{//[1,...]
      
    }
    return true;
  }
  isGoodSNR(samples){//signal to noise ratio
    if(!this.coa){
      this.coa = this.calcCoeff(750, samples.length);
      this.cob = this.calcCoeff(800, samples.length);
      this.coc = this.calcCoeff(850, samples.length);
    }
    const ga = this.goertzel(samples, this.coa);
    const gb = this.goertzel(samples, this.cob);
    const gc = this.goertzel(samples, this.coc);
    var gz = Math.max(ga,gc);
    gz *= 5;//noise threshold
    return gb > gz;
  }
  calcCoeff(freq, sampleLen){
    const a = Math.round(sampleLen * freq / sampleRate);
    const b = (2 * Math.PI * a) / sampleLen;
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
