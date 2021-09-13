import React, { useState } from 'react';

function SearchBox(props) {
    const [name, setName] = useState('');
    const submitHandler = e => {
        e.preventDefault();
        props.history.push(`/search/name/${name}`); //redirect to search page
    }; 
    return ( 
        <form className="search" onSubmit={submitHandler}>
            <div>
                <input type="text" name="qy" id="qy" onChange={e => setName(e.target.value)} />
                <button className="primary" type="submit"><i className="fa fa-search"></i></button>
            </div>
        </form>
    );
}

export default SearchBox;
