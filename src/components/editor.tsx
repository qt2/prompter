import { EditorProvider, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { useSetRecoilState } from "recoil";
import { editingState } from "../App";

const FocusExtension = Extension.create({
  name: "focusExtension",

  addKeyboardShortcuts() {
    return {
      Escape: () => this.editor.commands.blur(),
    };
  },
});

const extensions = [
  StarterKit,
  FocusExtension,
  Placeholder.configure({
    placeholder: "Write something...",
  }),
];

export function Editor() {
  const setFocus = useSetRecoilState(editingState);

  return (
    <EditorProvider
      extensions={extensions}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
    >
      <div></div>
    </EditorProvider>
  );
}
