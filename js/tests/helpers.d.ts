export declare function promised(itFunc: (done?: any) => Promise<any>): (done: any) => Promise<any>;
export declare function broken(itFunc: (done?: any) => Promise<any>, expectedErr: Error): (done: any) => Promise<any>;
