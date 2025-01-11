interface IpcRenderer {
  invoke(channel: string, ...args: any[]): Promise<any>;
  send(channel: string, ...args: any[]): void;
  on(channel: string, listener: (...args: any[]) => void): void;
  once(channel: string, listener: (...args: any[]) => void): void;
  removeListener(channel: string, listener: (...args: any[]) => void): void;
  removeAllListeners(channel?: string): void;
  sendSync(channel: string, ...args: any[]): any;
  sendTo(webContentsId: number, channel: string, ...args: any[]): void;
  sendToHost(channel: string, ...args: any[]): void;
  togglePin(shouldPin: boolean): Promise<boolean>;
  openExternal(url: string): void;
}

declare global {
  interface Window {
    ipcRenderer: IpcRenderer;
  }
}

export {};
