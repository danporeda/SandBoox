import { useTypedSelector } from "./use-typed-selector";

export const useCumulativeCode = (cellId: string) => {
  return useTypedSelector((state) => {
    const { data, order } = state.cells;
  
    const codeCells = order.filter((cellId) => data[cellId].type === 'code');
  
    const showFunc = `
      import _React from 'react';
      import _ReactDOM from 'react-dom';
      var show = (value) => {
        const root = document.querySelector('#root');
  
        if (typeof value === 'object') {
          if (value.$$typeof && value.props) {
            _ReactDOM.render(value, root);
          } else {
            root.innerHTML = JSON.stringify(value);
          }
        } else {
          root.innerHTML = value;
        }
      };
    `;
    const showFuncNoop = 'var show = () => {}';
    const cumulativeCode = [];
    for (let c of codeCells) {
      if (c === cellId) {
        cumulativeCode.push(showFunc);
      } else {
        cumulativeCode.push(showFuncNoop);
      }
      cumulativeCode.push(data[c].content);
      if (c === cellId) {
        break;
      }
    }
    return cumulativeCode;
  }).join('\n');
};