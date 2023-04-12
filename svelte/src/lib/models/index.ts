import type { IFileDef } from 'rockmelonqa.common';

export type IFileInfo = Omit<IFileDef, 'content' | 'isValid'>;
