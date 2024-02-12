# Performance API

## The Problem

so imagine we have the best website in the world and it take two minutes to load,so nobody will see it. i think wou know why we need the performance!

## Access The Performance Data

### `performance.now()`

the simples way is `performance.now()`.this method returns a high resolution timestamp in milliseconds. It represents the time elapsed since Performance.timeOrigin .(the time when navigation has started in window contexts, or the time when the worker is run in Worker and ServiceWorker contexts).

if you want know how much time has elapsed since a particular point in your code, you can do something like this:

```js
const t0 = performance.now()
doSomething()
const t1 = performance.now()
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`)
```

### `performance.getEntries()`

another way : `getEntries()` returns all the available performance entries.with `performance.getEntries()`we see a big array , most of the entries will relate to all the images, scripts and other things which are loaded by the page ( resources).

### `performance.getEntriesByType()`

this method returns an array of PerformanceEntry objects currently present in the performance timeline for a given type.in another word we can filter the result with `performance.getEntriesByType()`. so we have to pass an argument.

There are 6 types that you can query:

- measure: Measures allow us to easily measure the difference between two marks.
- resource: This relates to all the resources which are downloaded by the site.
- mark: These are custom markers that can be used to calculate the speed of your code.
- longtask: Long tasks are any task which take over 50ms to execute.
- paint: The paint entries relate to the pixels displayed on the screen.
- frame: Very experimental feature which allows developers to get data about how much work is done by the browser in one event loop. If the browser is doing too much work in one loop, the frame rate will drop and the user experience will be poor.

```js
console.log(performance.getEntriesByType('paint'))
// and we get something like this :
// PerformancePaintTiming {name: 'first-paint', entryType: 'paint', startTime: 326.40000000037253, duration: 0}
```

another example :

```js
// with this code we can understand how much take
// for every img in the page to load!
const resourceListEntries = performance.getEntriesByType('resource')

resourceListEntries.forEach((resource) => {
  if (resource.initiatorType == 'img') {
    console.log(
      `Time taken to load ${resource.name}: `,
      resource.responseEnd - resource.startTime
    )
  }
})

// output somthing like this :
// Time taken to load http://localhost:3000/static/media/rule2.084dfa9e2611ebd1e713.jpg:  4.599999999627471
```

### `performance.getEntriesByName`

this method returns an array of PerformanceEntry objects currently present in the performance timeline with the given name and type.
just by name `getEntriesByName(name)` and with both name and types `getEntriesByName(name, type)` if you want filter just by type see the last one "`performance.getEntriesByType()`"

## Performance Bottle Necks in React And Solutions

1. Rendering too many components:this can slow down performance. so what can we do?
   we can use `shouldComponentUpdate`, `React.memo`, and `PureComponent` to optimize component rendering and reduce unnecessary updates.
   simple Example :

```js
// Bad performance
// in this example every time we click on the button (count)
// all the 1000 child re-render
export default function App() {
  console.log('re render')
  const [number, setNumber] = React.useState(0)
  return (
    <div>
      <button onClick={() => setNumber(number + 1)}>count{number}</button>
      {Array.from({ length: 1_000 })
        .fill('hi im a child 👶🏻')
        .map((item, index) => {
          return <Child key={index} value={item} />
        })}
    </div>
  )
}

function Child({ value }) {
  console.log('child')
  return <div>{value}</div>
}

// Optimized
// in this example Child only re-render when its props have changed
// so if we click on the button we haven't re- render the Children only
// the number changes.
import { memo } from 'react'
const OptimizedChild = memo(Child)

export default function App() {
  console.log('re render')
  const [number, setNumber] = React.useState(0)
  return (
    <div>
      <button onClick={() => setNumber(number + 1)}>count{number}</button>
      {Array.from({ length: 1_000 })
        .fill('hi im a child 👶🏻')
        .map((item, index) => {
          return <Child key={index} value={item} />
        })}
    </div>
  )
}

function Child({ value }) {
  console.log('child')
  return <div>{value}</div>
}
```

2. Large state objects :Large state objects can cause React to spend a lot of time re-rendering and updating components. to avoid this we can use `React.useMemo` and `React.useCallback`.

example :

```js
// Not Optimized
// with this code when we re-render the component
// we re-calculate the value and re-create the function . every time!!!
// so we have bigger heap and at the end memory leak!
export default function App() {
  return <HeavyComponent value={20} />
}

const HeavyComponent = ({ value }) => {
  console.log('HeavyComponent Re-render')
  const [number, setNumber] = React.useState(0)

  const hugeCalculation = () => {
    // some expensive calculations here
    console.log('func re-create and calculate again')
    return value * 2
  }
  return (
    <button onClick={() => setNumber(number + 1)}>
      value : {number} -- {hugeCalculation()}
    </button>
  )
}


// Optimized
// whit this solution we re-create the function and re-calculate
// expensive value just when the [dependence arrays change]
export default function App() {
  return <HeavyComponent value={20} />
}

const HeavyComponent = ({ value }) => {
  console.log('HeavyComponent Re-render')
  const [number, setNumber] = React.useState(0)

  const hugeCalculation = React.useMemo(() => {
    // some expensive calculations here
    // i mean time and memory
    console.log('func re-create and re-calculate again')
    return value * 2
  }, [value])
  return (
    <button onClick={() => setNumber(number + 1)}>
      value : {number} -- {hugeCalculation}
    </button>
  )
}
```

3. Event Listeners :If the event listener is not removed when the component unmounts, the event listener, its callback function, and your component will all stay in memory, causing a memory leak. so clean u it after every render.
   so clean up that when component unmount !

```js
const [width, setWidth] = useState(window.innerWidth)
const [height, setHeight] = useState(window.innerHeight)

const resize = () => {
  setWidth(window.innerWidth)
  setHeight(window.innerHeight)
}

useEffect(() => {
  window.addEventListener('resize', resize)

  // here i mean : this clean up the EventListener after the component unmounts!
  return () => {
    window.removeEventListener('resize', resize)
  }
})
```

4. Inefficient data fetching : can cause slow page loading and awful UX. we have some solution .

- caching
- pagination
- lazy loading

```js
// in this code we fetch on every re-render.. Awful
export default function App() {
  const [data, setData] = React.useState([])

  const url = 'https://jsonplaceholder.typicode.com/posts'

  async function fetchData(url) {
    const response = await fetch(url)
    const data = await response.json()
    setData(data)
  }

  React.useEffect(() => {
    fetchData(url)
    //  keep this part in your mind
  })

  return (
    <ul>
      {data.map((item) => (
        <li key={item.id}>{item.title}</li>
      ))}
    </ul>
  )
}

// if we add a dependency array to useEffect ...

export default function App() {
  const [data, setData] = React.useState([])
  const url = 'https://jsonplaceholder.typicode.com/posts'
  async function fetchData(url) {
    const response = await fetch(url)
    const data = await response.json()
    setData(data)
  }
  React.useEffect(() => {
    fetchData(url)
  // just fetched at the first time
  },[])

  return (
    <ul>
      {data.map((item) => (
        <li key={item.id}>{item.title}</li>
      ))}
    </ul>
  )
}

// we can improve with useMemo()
```

5. inline styles: use the inline css just when you must do it and you haven't any other choice! use classes or css module or css in Js (emotion and styled component or )

```js
// Not Optimized

export default function App() {
  return (
    <div
      style={{
        borderRadius: '8px',
        boxShadow: '0 0 5px rgba(0, 0, 0, 0.5)',
        padding: '1rem',
        backgroundColor: 'blue',
        width:'100px'
      }}
    >
      A styled Div
    </div>
  )
}

// Optimized
import './styles.css'

export default function App() {
  return <div className='box'>A styled Div</div>
}
```

6. Inefficient Routing : use `React.Lazy()` with this solution we just tha pages we need and user requested not all of them

```js
import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Loading, Navbar } from './components'

const Main = lazy(() => import('./pages/Main'))
const Easy = lazy(() => import('./pages/Easy'))
const Medium = lazy(() => import('./pages/Medium'))
const ErrorPage = lazy(() => import('./pages/ErrorPage'))

export default function App() {
  return (
    <Router>
      <Navbar />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path='' element={<Main />} />
          <Route path='easy' element={<Easy />} />
          <Route path='medium' element={<Medium />} />
          <Route path='*' element={<ErrorPage />} />
        </Routes>
      </Suspense>
    </Router>
  )
}
```

7. and so on ...
