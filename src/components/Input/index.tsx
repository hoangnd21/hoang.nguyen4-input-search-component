import { useCallback, useRef, useState } from "react";
import { debounce } from "../../utils/deboucne";
import { fetchData } from "../../utils/fetch-data";
import Loader from "../Loader";
import "./input.scss";

export interface InputProps {
  /** Placeholder of the input */
  placeholder?: string;
  /** On click item handler */
  onSelectItem: (item: string) => void;
}

interface IResult {
  id: number;
  value: string;
}

const Input = ({ placeholder, onSelectItem }: InputProps) => {
  // DO NOT remove this log
  console.log('input re-render')

  // Your code start here
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<IResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const isInitial = !inputRef.current?.value;
  
  const debouncedFetch = debounce(
    async (query: string) => {
      if (!query.length) {
        setResults([]);
        return;
      }
      setLoading(true);

      try {
        const results = await fetchData(query);
        if (query !== inputRef.current?.value) {
          setResults([]);
          return;
        }
        if (!results.length) {
          setResults([{
            id: 0,
            value: 'No result'
          }])
          return;
        }
        setResults(results.map((resultStr, index) => ({
          id: index + 1,
          value: resultStr
        })));
      } catch (e) {
        setResults([{ id: -1, value: e as string }])
        throw e;
      } finally {
        setLoading(false)
      }
    },
    100
  )

  const onInputChanged = (changeEvent: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = changeEvent.target;
    debouncedFetch(value);
  }

  const getResultClass = useCallback((id: number): string => {
    const classes = ['item'];
    if (id < 0) classes.push('results-container__error');
    if (id === 0) classes.push('results-container__no-result');
    else classes.push('results-container__result');
    return classes.join(' ');
  }, [])

  return <>
    <input ref={inputRef} placeholder={placeholder} onChange={onInputChanged}></input>
    {!isInitial && <section className="results-container">
      {loading ? <Loader /> : results.map((result) => {
        return <div key={result.id} className={getResultClass(result.id)}>
          <div onClick={() => onSelectItem(result.value)}>{result.value}</div>
        </div>
      })}
    </section>}
  </>
  // Your code end here
};

export default Input;

