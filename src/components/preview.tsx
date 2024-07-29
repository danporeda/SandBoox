import './preview.css';
import { useRef, useEffect } from 'react';

interface PreviewProps {
  code: string;
  err: string;
  setErr: React.Dispatch<React.SetStateAction<string>>;
}

const html = `
    <html>
      <head><style>html { background-color: white; }</style></head>
      <body>
        <div id="root"></div>
        <script>
          const handleError = (err) => {
            const root = document.querySelector('#root');
            root.innerHTML = '<div style="color: red;"><h4>Runtime Error</h4>' + err + '</div>';
          };

          window.addEventListener('error', (event) => {
          event.preventDefault();
            handleError(event.error)
          })

          window.addEventListener('message', (event) => {
            try {
              eval(event.data);
            } catch (err) {
              // window.top.postMessage(err, '*');
              handleError(err);
            }
          }, false);
        </script>
      </body>
    </html>
  `;

const Preview: React.FC<PreviewProps> = ({ code, err, setErr }) => {
  const iframe = useRef<any>();

  useEffect(() => {
    const handleMessage = (event: any) => {
      setErr(event.data.message);
    }
    window.addEventListener('message', handleMessage, false);
  }, [setErr])
  
  useEffect(() => {
    iframe.current.srcdoc = html;
    setTimeout(() => {
      iframe.current.contentWindow.postMessage(code, '*');
    }, 50)
  }, [code]);
  

  return (
    <div className="preview-wrapper">
      <iframe 
        title="preview" 
        ref={iframe}
        sandbox="allow-scripts"
        srcDoc={html}
      />
      {code && <div>{code}</div>}
      {err && <div className="preview-error">{err}</div>}
    </div>
  )
};

export default Preview;