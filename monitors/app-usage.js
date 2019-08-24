const activeWin = require('active-win');
const iohook = require('iohook');

const config = require('../services/config');
const log = require('../services/log');

let appsToLog, eventsToLog;
let logger;

async function logEvent(msg) {
  const window = await activeWin();
  if (appsToLog.find(app => window.owner.bundleId.toLowerCase().indexOf(app.toLowerCase()) > -1) &&
  eventsToLog.find(e => e.toLowerCase() === msg.type.toLowerCase())) {
    // TODO: handle scenario where mouse events (esp move, wheel) happen outside bounds of active win
    logger.info({
      event: {
        button: msg.button,
        clicks: msg.clicks,
        x: msg.x,
        y: msg.y,
        type: msg.type // note that 'type' is the only thing we log for key events
      },
      window
    });
  }
}

// iohook.on('keypress, (msg) => {}); // this event stopped firing after I fixed a bug in the underlying C library
iohook.on('keydown', (msg) => logEvent(msg));
iohook.on('keyup', (msg) => logEvent(msg));
iohook.on('mousedown', (msg) => logEvent(msg));
iohook.on('mouseclick', (msg) => logEvent(msg));
iohook.on('mousewheel', (msg) => logEvent(msg));
iohook.on('mousemove', (msg) => logEvent(msg));
iohook.on('mousedrag', (msg) => logEvent(msg));

// iohook.setDebug(true);

iohook.init = (options) => {
  appsToLog = options.apps || config.get('monitor.apps') || [];
  const keyEvents = options.keyEvents || config.get('monitor.keyEvents') || [];
  const mouseEvents = options.mouseEvents || config.get('monitor.mouseEvents') || [];
  eventsToLog = keyEvents.concat(mouseEvents);
  logger = log.getLogger('app-usage');
}
iohook.name = 'app-usage';

module.exports = iohook;