import React from 'react';
import Snackbar from 'material-ui/Snackbar';

const Message = ({open, content, onClick}) => {
    return <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal:'right' }}
        open={open}
        onClose={onClick}
        SnackbarContentProps={{
            'aria-describedby': 'message-id',
        }}
        message={<span id="message-id">{content}</span>}
    />
}

export default Message;