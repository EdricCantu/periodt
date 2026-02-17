class Proc extends AudioWorkletProcessor{
  state = [0,0];
  process([input]){
    if(!this.state[0]){//[0,...]
      const snrgood = this.isGoodSNR(input);
      if(!this.state[1]){//blackened//[0,0]
        if(snrgood){//move to yellow
          state = [0, 1, performance.now()];
          postMessage(1)
        }else{}//still black
      }else{//yellowed//[0,1,...]
        if(snrgood){//not continuous, fail
          state = [0,0];
          postMessage(3)
        }else if(performance.now() - state[2] > 4000){//still continuing, pass if time reached
          postMessage(2);
          return false;
        }else{}//continuing, standby if time not reached
      }
    }else{//[1,...]
      
    }
    return true;
  }
  isGoodSNR(samples){
    const ga = goertzel(samples, 750);
    const gb = goertzel(samples, 800);
    const gc = goertzel(samples, 850);
    var gz = Math.max(ga,gc);
    gz *= 5//noise threshold;
    return gb > gc;
  }
  goertzel(samples, freq){
    if(!this.co){
      const a = Math.round(samples.length * 800 / sampleRate);
      const b = (2 * Math.PI * a) / samples.length;
      this.co = 2 * Math.cos(b);
    }
    var prev1 = 0;
    var prev1 = 0;
    var i = 0;
    for(const sample of samples){
      const c = sample + this.co * prev1 - prev2;
      prev2 = prev1;
      prev1 = c;
    }
    return
      prev2**2  +  prev1**2
      - this.co*prev1*prev2;
  }
}

registerProcessor("processor", Proc);
