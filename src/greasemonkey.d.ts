declare function GM_registerMenuCommand(caption: string, onClick: Function, accessKey?: string): void;
declare function GM_setValue(name: string, value: any): void;
declare function GM_getValue(name: string, defaultValue?: any): any;
declare function GM_deleteValue(name: string): void;