import React, { useEffect, useState, useReducer} from 'react';
import "./main.css";
import { reducer } from './reducers';

import Node from "../pfv/node/node"
import Navbar from './navbar/navbar';

import { Djisktra } from "./algortihms/Djisktra";
import { BFS } from "./algortihms/BFS";
import { DFS } from "./algortihms/DFS"
import { GenerateGrid, GenerateRandomWalls , RemoveWeights, AlgoCall} from "./helpers.jsx" 
import { GameOfLife } from "./algortihms/GameOfLife";
import { isWeighted } from "./data";

var rows = 17, cols = Math.floor((document.body.clientWidth - 65) / 40) - 1, wall_weight = 1e6;

const App = (() => {
    document.title = "Path Finding Visualizer";
    const initalState = {
        idx : 0,
        startPos : 0,
        endPos : rows*cols - 1,
        pressed: false,
        weight : wall_weight,
        start : false,
        Description : "",
    };
    
    const [grid, setGrid] = useState(GenerateGrid(rows, cols));
    const [state, dispatch] = useReducer(reducer, initalState);


    const handlewalls = (idx) => {
        if (state.pressed === false || state.start === true){
            return;
        }
        let newgrid = grid.slice();
        newgrid[idx].Weight = (newgrid[idx].Weight == state.weight ? 1 : state.weight);
        setGrid(newgrid);
    };

    async function Animate(Arr, i, key) {
        if (i == Arr.length) return true;
        let myPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                let newgrid = grid.slice();
                newgrid[Arr[i]][key] ^= true;
                setGrid(newgrid);
                resolve(true);
            }, 30000 / document.getElementById("time").value);
        });
        if (await myPromise) {
            return Animate(Arr, i + 1, key);
        }
    };

    async function AnimateVisitedOrder(Order, shortestpath) {
        let myPromise = new Promise((resolve, reject) => {
            resolve(Animate(Order, 0, "isVisited"));
        });
        if (await myPromise) {
            Animate(shortestpath, 0, "isPath");
        }
        dispatch({type : 'stopGame'});
    };

    async function AnimateGameOfLife(){
        let myPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log(grid);
                let new_grid = GameOfLife(grid , rows , cols);
                setGrid(new_grid);
                resolve(true);
            } , document.getElementById("time").value);
        });
        if(await myPromise){
            AnimateGameOfLife();
        }
    };

    async function initGame(){
        let myPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                dispatch({type : 'startGame'});
                let new_grid = GenerateRandomWalls(grid);
                setGrid(new_grid);
                console.log(grid);
                resolve(true);
            },1000);
        });
        if(await myPromise){
            AnimateGameOfLife();
        }
    }

    const RunAlgo = (key) => {
        if(!isWeighted[key]){
            let new_grid = RemoveWeights(grid);
            setGrid(new_grid);
        }
        if(key=="GameOfLife"){
            initGame();
            return;
        }
        const algos = {
            Djisktra: Djisktra(rows, cols, state.startPos, state.endPos, grid),
            BFS: BFS(rows, cols, state.startPos, state.endPos, grid),
            DFS: DFS(rows, cols, state.startPos, state.endPos, grid),
        };
        dispatch({type : 'setDescription', payload : key});
        const [Order, shorteshtpath] = algos[key];
        AnimateVisitedOrder(Order, shorteshtpath);
    };

    return (
        <section >
            <Navbar 
                state = {state}
                reducer = {reducer}
                dispatch = {dispatch}
                RunAlgo = {RunAlgo}
                reset = {() => setGrid(GenerateGrid(rows, cols))}
            />
            <div style={{ width: (cols) * 42 }} className="grid">
                {grid.map(e => (
                    <div
                        onDoubleClick={() => dispatch({type : 'changePosition', payload : e.idx})}
                        onMouseDown={() => dispatch({type : 'MouseChange'})}
                        onMouseUp={() => dispatch({type : 'MouseChange'})}
                        onMouseEnter={() => handlewalls(e.idx)}
                    >
                        <Node
                            key = {e}
                            idx = {e.idx}
                            isVisited = {e.isVisited}
                            isPath = {e.isPath}
                            Weight = {e.Weight}
                            isStart = {state.startPos === e.idx}
                            isEnd = {state.endPos === e.idx}
                            pressed = {state.pressed}
                        />
                    </div>
                ))}
                <p>Description: {state.Description}</p>
            </div>
        </section>
    );
});
export default App;