import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

import axios from 'axios';
import axiosCancel from 'axios-cancel';

import { range, Observable } from 'rxjs';
import { fromEvent, Subscriber } from 'rxjs';
import { map, filter, switchMap } from 'rxjs/operators';

import { from, just, fromPromise, combine, combineArray, of, mergeArray } from 'most';
import logger from 'logger';

axiosCancel(axios);

const simpleObserver = () => {
  let observable$ = Observable.create((observer) => {
    // internal interaction with observable
    observer.next(1);
    observer.next(2);
    observer.next(3);

    //==> observer.error( 'error-message' );
    //==> observer.complete();
  });
  let observer = {
    next: data => console.log('[data] => ', data),
    complete: data => console.log('[complete]'),
  };
  let subscription = observable$.subscribe(observer);// outside interaction with observable
  subscription.next(4);
  subscription.next(5);
  subscription.complete();
}

const axiosObserver = () => {
  let observable$ = Observable.create((observer) => {
    axios.get('https://jsonplaceholder.typicode.com/users')
      .then((response) => {
        observer.next(response.data);
        observer.complete();
      })
      .catch((error) => {
        observer.error(error);
      });
  });
  let subscription = observable$.subscribe({
    next: data => console.log('[data] => ', data),
    complete: data => console.log('[complete]'),
  });
}

class AxiosSubscriber extends Subscriber {
  constructor(observer) {
    super(observer);

    // create sample request id
    this.requestId = Math.random() + '-xhr-id';

    // XHR abort pointer
    this.aborted = false;
    console.log(this.aborted)
    // make axios request on subscription
    axios.get('https://jsonplaceholder.typicode.com/users', { requestId: this.requestId })
      .then((response) => {
        observer.next(response.data);
        observer.complete();
      })
      .catch((error) => {
        observer.error(error);
      });
  }

  unsubscribe() {
    super.unsubscribe();
    // cancel XHR
    if (this.aborted === false) {
      axios.cancel(this.requestId);
      this.aborted = true;
      console.log(this.aborted)
    }
  }
}

let observable$ = new Observable((observer) => {
  return new AxiosSubscriber(observer);
});

const Test = () => {
  useEffect(() => {
    fromEvent(document.getElementById('typeahead-input'), 'input').pipe(
      switchMap(() => observable$)
    ).subscribe(console.log);
  });
  return (<input type="text" id="typeahead-input" />);
}

const myProimse = new Promise((resolve, reject) => {
  if (10 < 9) {
    reject(new Error('The promise was rejected by using reject function.'));
  }
  else {
    resolve('promise resolved')
  }
});

function App() {
  //axiosObserver();
  const data = [1, 2, 3, 4, 5];
  //from(data).observe( x => console.log(x) );
  //from(data).thru(switchMap(x => console.log(x)));
  just(data).observe(console.log.bind(console))
  // fromPromise(myProimse).observe(x => console.log(x));

  // const stream1 = of('Hello');
  // const stream2 = of('World!');
  // const add = (x, y) => x + y
  // const combObserver = combine(add, stream1, stream2);
  //combObserver.observe(console.log.bind(console));
  //combObserver.thru(console.log.bind(console))

  // const stream3 = just(data);
  // const stream4 = just(data);
  // const combObserver1 = combineArray(add, [stream3, stream4]);
  // combObserver1.observe(console.log.bind(console));

  // const mergeObs = mergeArray([stream3, stream4])
  // mergeObs.observe(console.log.bind(console))

  

  return (
    <div className="App">
      <header className="App-header">
        <p>
          {}
          {/* {Test()} */}
        </p>
      </header>
    </div>
  );
}


export default App;
