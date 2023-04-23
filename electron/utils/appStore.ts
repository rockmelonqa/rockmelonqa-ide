import Store from 'electron-store';

interface ISchema {
    isMaximize: boolean;
}

export const store = new Store<ISchema>();
