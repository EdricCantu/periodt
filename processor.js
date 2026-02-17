class Proc extends AudioWorkletProcessor{
  process(inputs, outputs, params){
    console.log(inputs, outputs, params);//idk what I'm (going to be) doing rn, but i plan to, and you know i plan to when i pull this move
  }
}

registerProcessor("processor", Proc);
