import {consoleOn} from './app';

export default consoleMsg = (msg,type) => {
  const ssConsole = document.getElementById('console'),
  if(!consoleOn) {
    consoleOn = true;
    const color = type === 'err' ?  'rgb(179, 58, 72)' : type === 'msg' ? 'rgb(72, 67, 172)' : 'gray';
    ssConsole.style.color = color;
    ssConsole.innerText = msg;
    setTimeout(() => { ssConsole.innerText = ''; consoleOn = false;}, 3000);
  }
}