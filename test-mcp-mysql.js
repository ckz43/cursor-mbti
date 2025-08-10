#!/usr/bin/env node

import { spawn } from 'child_process';

// Test the MCP MySQL server
const mcpServer = spawn('mcp-mysql', [
  '--host', 'localhost',
  '--port', '3306',
  '--user', 'mbti_user',
  '--database', 'mbti_test',
  '--password', 'MbtiPass123!'
]);

// Send a simple MCP initialization message
const initMessage = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'test-client',
      version: '1.0.0'
    }
  }
};

console.log('Starting MCP MySQL server test...');

mcpServer.stdout.on('data', (data) => {
  console.log('MCP Server Response:', data.toString());
});

mcpServer.stderr.on('data', (data) => {
  console.error('MCP Server Error:', data.toString());
});

mcpServer.on('close', (code) => {
  console.log(`MCP server exited with code ${code}`);
});

// Send initialization message
setTimeout(() => {
  console.log('Sending initialization message...');
  mcpServer.stdin.write(JSON.stringify(initMessage) + '\n');
}, 1000);

// Close after 5 seconds
setTimeout(() => {
  console.log('Closing MCP server...');
  mcpServer.kill();
}, 5000);