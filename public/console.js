
function initConsole(consoleOnFlag){
  return (msg, type) => {
    const ssConsole = document.getElementById('console');
    if(!consoleOnFlag) {
      consoleOnFlag = true;
      const color = type === 'err' ?  'rgb(179, 58, 72)' : type === 'msg' ? 'rgb(72, 67, 172)' : 'gray';
      ssConsole.style.color = color;
      ssConsole.innerText = msg;
      setTimeout(() => { ssConsole.innerText = ''; consoleOnFlag = false;}, 3000);
    }
  }
}

export default initConsole;