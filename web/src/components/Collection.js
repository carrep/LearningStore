/*
  @author Félix Fuin
  Copyright Nokia 2017. All rights reserved.
*/

import React, { Component } from 'react';
import renderHTML from 'react-render-html';

import Source from './data';
import Navigation from './Navigation';
import HeaderComponent from './Header';
import Thumbnail from './Thumbnail';
import B from './back';
import NotFound from './NotFound';

export default class Collection extends Component {

  state = { isLoading:true, lim:20  }
  storeDef;

  componentWillMount() {
    window.scrollTo(0, 0);
    const {name} = this.props.match.params;
    Source.getSync(name)
    .then( store => this.setState({isLoading:false, store:store}) )
    
    this.storeDef = Source.getDef(name);
    B.back = true;
  }

  loadMore = () => this.setState({lim:this.state.lim + 40}); 

  map(coll) {
    let counter = 0;
    let ret = coll.Solutions.filter( (itemID, index) => {
      const item = this.state.store.getByID(itemID);
      return item && item.Icon && !item.del && !item.Wip ? true : false ;
    })
    .map( (itemID, index) => {
      const item = this.state.store.getByID(itemID);
      counter++;
      return counter % 5 === 0 ?
        <Thumbnail  key={itemID} noMargin="yes" props={this.props} data={item} store={this.storeDef} /> 
        :
        <Thumbnail  key={itemID} props={this.props} data={item} store={this.storeDef} />
    });

    if (ret.length > this.state.lim+1){
      ret = ret.slice(0, this.state.lim);
      return (
        <div>
          <div>{ret}</div>
          <div className="loadMore" onClick={this.loadMore}>See more...</div>
        </div>
      );
    }
    return ret;
  }

  render() {
    
    if (this.state.isLoading) return null;

    B.set(this);
    
    const { id } = this.props.match.params;
    const coll = this.state.store.getByID(id);
    if (!coll) return <NotFound />

    return (
      <div>
        <div className="head">
          <HeaderComponent props={this.props} data={this.storeDef}/>
          <div className="menu">
            <div className="wrapper">
              <Navigation props={this.props} data={this.storeDef}/>
            </div>
          </div>
        </div>
        <div className="store">
          <div className="wrapper">
            <h2>{ coll.Title }</h2>
            <div>{ renderHTML(coll.Description || '') } </div>
            { this.map(coll) }
          </div>
        </div>
      </div>
    );
  }
}