// Performance API In JS


// Bottle Necks 

// +++++++++++++++++++++++++ too many components +++++++++++++++++++++++++
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

// +++++++++++++++++++++++++ Large state objects +++++++++++++++++++++++++
// Not Optimized
// with this code when we re-render the component
// we re-calculate the value and re-create the function . every time!!!
// so we have bigger heap and at the end memory leak!
export default function App() {
    return <HeavyComponentNotOpt value={20} />
  }
  
  const HeavyComponentNotOpt = ({ value }) => {
    console.log('HeavyComponentNotOpt Re-render')
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

  // +++++++++++++++++++++++++ Event Listeners  +++++++++++++++++++++++++

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


//+++++++++++++++++++++++++ Inefficient data fetching +++++++++++++++++++++++++
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



//+++++++++++++++++++++++++ Bas styling and inline styling +++++++++++++++++++++++++

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


  //+++++++++++++++++++++++++ Inefficient Routing & Lazy loading and code splitting+++++++++++++++++++++++++

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