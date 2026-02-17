class Proc extends AudioWorkletProcessor{
  state = [0,0];
  process([input]){
    if(!this.state[0]){//[0,...]
      g = this.goertzel(input);
      if(!this.state[1]){//blackened//[0,0]
        if(g > 0.5){//move to yellow
          state = [0, 1, performance.now()];
          postMessage(1)
        }else{}//still black
      }else{//yellowed//[0,1,...]
        if(g <= 0.5){//not continuous, fail
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
  goertzel(samples){
    
  }
}

registerProcessor("processor", Proc);
