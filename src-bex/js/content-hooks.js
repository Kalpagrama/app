// Hooks added here have a bridge allowing communication between the BEX Content Script and the Quasar Application.
// More info: https://quasar.dev/quasar-cli/developing-browser-extensions/content-hooks

var iFrame = document.createElement('iframe')
// defaultFrameHeight = '500px'

Object.assign(iFrame.style, {
  width: '100%',
  height: '500px',
  // position: 'fixed',
  // top: '0',
  // right: '0',
  // bottom: '0',
  // left: '0',
  // border: '0',
  // zIndex: '9999999', // Make sure it's on top
  // overflow: 'visible'
})

export default function attachContentHooks (bridge) {
  // id of #secondary-inner
  // Hook into the bridge to listen for events sent from the client BEX.
  /*
  bridge.on('some.event', event => {
    if (event.data.yourProp) {
      // Access a DOM element from here.
      // Document in this instance is the underlying website the contentScript runs on
      const el = document.getElementById('some-id')
      if (el) {
        el.value = 'Quasar Rocks!'
      }
    }
  })
  */
}

(function () {
  alert('injecting App')
  // When the page loads, insert our browser extension app.
  iFrame.src = chrome.runtime.getURL('www/index.html#/node/82139254913810496/nodes')
  let target = document.getElementById('secondary-inner')
  target.prepend(iFrame)
})()
