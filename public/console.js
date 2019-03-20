
function initConsole(){
  const ssConsole = document.getElementById('console');
  let isOn = false;
  return (msg, type) => {
    if (!isOn) {
      isOn = true;
      const color = type === 'err' ?  'rgb(179, 58, 72)' : type === 'msg' ? 'rgb(72, 67, 172)' : 'gray';
      ssConsole.style.color = color;
      ssConsole.innerText = msg;
      setTimeout(() => { ssConsole.innerText = ''; isOn = false;}, 3000);
    }
  }
}

export default initConsole;