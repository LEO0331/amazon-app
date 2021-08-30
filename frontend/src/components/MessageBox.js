import React from 'react';
//children(of the <MessageBox>) is the error message
function MessageBox(props) {
  return (
    <div className={`alert alert-${props.variant || 'info'}`}>
      {props.children}
    </div>
  );
}

export default MessageBox;
