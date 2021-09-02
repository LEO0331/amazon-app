import React from 'react';
//children(of the <MessageBox>) is the error message
function MessageBox(props) {
  //3 kinds of message color
  return (
    <div className={`alert alert-${props.variant || 'info'}`}>
      {props.children}
    </div>
  );
}

export default MessageBox;
