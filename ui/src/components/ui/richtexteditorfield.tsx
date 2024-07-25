import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const RichTextEditorField = ({ placeholder, setEditorHtml, editorHtml }) => {
  const handleChange = (html) => {
    setEditorHtml(html);
  };

  return (
    <div>
      <ReactQuill
        onChange={handleChange}
        value={editorHtml}
        modules={RichTextEditorField.modules}
        formats={RichTextEditorField.formats}
        bounds={".app"}
        placeholder={placeholder}
      />
    </div>
  );
};

/*
 * Quill modules to attach to editor
 * See https://quilljs.com/docs/modules/ for complete options
 */
RichTextEditorField.modules = {
  toolbar: [["image"]],
  clipboard: {
    // toggle to add extra line breaks when pasting HTML:
    matchVisual: false,
  },
};

/*
 * Quill RichTextEditorField formats
 * See https://quilljs.com/docs/formats/
 */
RichTextEditorField.formats = ["link", "image"];

export default RichTextEditorField;
