# mobx-localstorage
A declarative reactive localStorage using MobX

#### Install
```bash
yarn add mobx-localstorage
```
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
import { autorun } from 'mobx';
import localStorage from 'mobx-localstorage';

autorun(() => {
  console.log(localStorage.getItem('foo'));
});

localStorage.setItem('foo', 'bar');

// print bar
```

By default `mobx-localstorage` treats value as JSON, due to historical reasons. Since `v1.2.0` user can specify custom parser and stringifier.

```js
localStorage.configure({
  parser: x => x,
  stringify: x => String(x),
})
```
