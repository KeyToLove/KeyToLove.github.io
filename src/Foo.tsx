import React from 'react';

export interface Iprops {
  name: string;
}

const Foo = (props: Iprops) => {
  return <h1> hello {props.name || 'Mike'} </h1>;
};

export default Foo;
