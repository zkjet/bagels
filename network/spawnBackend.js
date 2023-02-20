#!/usr/bin/env node
import { spawn } from 'child_process'
import { parentPort, isMainThread } from 'worker_threads'
import { getFilepath, getPathDirname } from '../utils.js'

async function main() {
  const serverDir = getFilepath([getPathDirname(), 'server'])

  const serverToLookIn = process.cwd();

  if (!serverToLookIn) { 
    console.log('error starting server, plz restart bagels!');
    return;
  }

  const nodeProcess = spawn('nodemon', ['startServer.js', serverToLookIn], {cwd: serverDir})

  nodeProcess.stdout.on('data', (data) => {
    if (data.toString().includes('server started and listening for requests')) {
      parentPort.postMessage('started')
    } else { 
      console.log(data.toString());
    }
  })

  nodeProcess.stderr.on('data', (data) => {
    if (data.toString().includes('EADDRINUSE: address already in use')) {
      console.error('Error starting the server \n')
      console.log('There is already a process on port 9090\n')
      console.log('to kill the process, run: `lsof -i tcp:9090`\n')
      console.log('then run: `kill {port}` with the port printed from the above command\n')
    } else {
      console.error('Error starting the server: ', data.toString()); 
    }
  });

  if (!isMainThread) {
    parentPort.postMessage(nodeProcess.pid)
  }
}

main()
