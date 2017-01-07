# mobx-localstorage
A declarative reactive localStorage using MobX

#### Install
```bash
npm i -S mobx-localstorage
```

#### Features
* Higher performance than native getter
* Synchronize with external changes
* Support native APIs and MobX APIs

#### Usage
Same as native but can be observed by MobX
```js
const { autorun } = require('mobx');
const localStorage = require('mobx-localstorage');

autorun(() => {
  console.log(localStorage.getItem('foo'));
});

localStorage.setItem('foo', 'bar');

// print bar
```
