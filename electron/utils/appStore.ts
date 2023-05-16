import Store from 'electron-store';

interface ISchema {
    isMaximize: boolean;
    openSelectedProject: boolean;
}

export const store = new Store<ISchema>();
