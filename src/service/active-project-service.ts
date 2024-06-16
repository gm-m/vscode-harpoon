import { NavigationDirection } from "../commands/navigate-editor";

export type Editor = {
    editorId?: number;
    fileName: string;
};

function getTrimmedEditor(editor: Editor) {
    editor.fileName = editor.fileName.trim();
    return editor;
}

export default class ActiveProjectService {
    constructor(private _activeEditors: Editor[], private _previousEditor?: Editor) {}

    public addEditor(editor: Editor) {
        editor = getTrimmedEditor(editor);
        if (this.hasEditor(editor) && !editor.editorId) {
            return;
        }
        if (editor.editorId) {
            // Ensure that the editor is always put at the decided index
            for (let i = 0; i < editor.editorId; i++) {
                if (this._activeEditors.length < i) {
                    this._activeEditors.push({
                        fileName: "_",
                    });
                }
            }
            this._activeEditors[editor.editorId - 1] = editor;
        } else {
            const firstFiller = this._activeEditors.findIndex(item => item.fileName === "_");
            if (firstFiller === -1) {
                this._activeEditors.push(editor);
            } else {
                this._activeEditors[firstFiller] = editor;
            }
        }
    }

    public getEditor(id: number) {
        return this._activeEditors[id - 1];
    }

    public getNextNonFillerEditorIndex(currentEditorIndex: number, direction: NavigationDirection) {
        if (direction === "navigateNext") {
            const nextIndex = this.findNextNonFillerEditorIndex(currentEditorIndex + 1);
            return nextIndex !== -1
                ? nextIndex
                : this.findNextNonFillerEditorIndex(0, currentEditorIndex);
        }

        const nextIndex = this.findPreviousNonFillerEditorIndex(currentEditorIndex - 1);
        return nextIndex !== -1
            ? nextIndex
            : this.findPreviousNonFillerEditorIndex(this._activeEditors.length - 1, currentEditorIndex + 1);
    }

    private findNextNonFillerEditorIndex(fromIndex: number, toIndex: number = this._activeEditors.length) {
        for (let i = fromIndex; i < toIndex; i++) {
            if (!this.isFillerEditor(this._activeEditors[i])) {
                return i;
            }
        }

        return -1;
    }

    private findPreviousNonFillerEditorIndex(fromIndex: number, toIndex: number = 0) {
        for (let i = fromIndex; i >= toIndex; i--) {
            if (!this.isFillerEditor(this._activeEditors[i])) {
                return i;
            }
        }

        return -1;
    }

    private isFillerEditor(editor: Editor): boolean {
        return editor.fileName === "_";
    }

    public set activeEditors(editors: Editor[]) {
        const hasActualEditor = editors.some(e => e.fileName !== "_");
        if (hasActualEditor) {
            this._activeEditors = editors.map(getTrimmedEditor);
        } else {
            this._activeEditors = [];
        }
    }

    public setPreviousEditor(editor: Editor) {
        this._previousEditor = editor;
    }

    public getPreviousEditor(): Editor | undefined {
        return this._previousEditor;
    }

    public get activeEditors(): Editor[] {
        return this._activeEditors;
    }

    public hasEditor(editor: Editor) {
        return this._activeEditors.some(e => e.fileName === editor.fileName);
    }
}
