/*
  @author Gilles Gerlinger
  Copyright Nokia 2017. All rights reserved.
*/

import editCtl from './editCtl';

class Data {
  data = [];
  ids = [];

  create(name, data) {
    data.forEach( item => {
      if (item.ID) {
        this.ids[item.ID] = item;
        this.data.push(item);
        item.type = item.type || 2;
        if (!item.sid) item.sid = name;
        if (item.Url && item.Url.all) {
          item.Url = item.Url.all;
          let tmp = item.Url.split('(');
          item.Url = tmp[0].trim();
          if (tmp[1]) item.btn = tmp[1].split(')')[0];
        }
        if (item.Solutions) item.Solutions = item.Solutions.filter( id => id ? true : false );
      }
    });

    editCtl.load(name);// apply changes if any
  }

  getByID(id) { return this.ids[id]; }

  filter(name, term) {
    term = term.toLowerCase();
    return this.data.filter( item => {
      if (item.del) return false;
      let keys = Object.keys(item);
      for (let i=0; i<keys.length; i++) {
        let key = keys[i];
        if ((typeof item[key] === 'string' || item[key] instanceof String) &&
          item[key].toLowerCase().indexOf(term) > -1)
          return true;
      }
      return false;
    })    
  }
}

class Store {
  defs = [];
  stores = [];

  get(name) { return this.stores[name]; }
  set(name, data) { 
    if (!this.get(name)) {
      this.stores[name] = new Data();
      this.stores[name].create(name, data);
      console.log('loaded', name, this.stores[name].data.length, 'items');
    }
    return this.get(name);
  }

  getSync(name) {
    return new Promise( resolve  => {
      const store = this.get(name);
      if (store) resolve(store);
      else this.synchro = resolve;
    });
  }

  getDef(name) { return this.defs[name]; }
  setDefs(storeJson) { storeJson.forEach( (store) => this.defs[store.id] = store ); }

  fetch(name, url, zip) {
    return new Promise( (resolve, reject) => {
      if (this.stores[name]) resolve(this.stores[name]);
      else {
        const req = new XMLHttpRequest();
        req.open('GET', url, true);
        req.responseType = zip ? 'arraybuffer' : 'text';
        req.onload = (oEvent) => {
          if (req.response) {
            // console.log(name, url, req, req.responseText);
            let responseJson = JSON.parse(zip ? (req.response, {to: 'string'}) : req.responseText);
            resolve(this.set(name, responseJson));
            if (this.synchro) this.synchro(this.get(name));
          }
        }
        req.onerror = (oEvent) => { 
          console.log(oEvent);
          reject(oEvent); 
        }
        req.send(null);
      }
    });
  }  

  format(text) {
    return text ? text.replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/<.*?>/g, '') : '';
  }

  filter(name, term) { return this.get(name).filter(name, term); }

}

export default new Store();