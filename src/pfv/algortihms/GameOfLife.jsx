import {_node} from "./helpers";
export function GameOfLife(grid, rows , cols){
    const wall_weight = 1e6;
    const iterate = [1,0,-1];
    let new_grid = grid.slice();
    const chance = () =>{
        return (Math.floor(Math.random() * 10)%2 == 1 ? 1 : wall_weight);
    }

    const countAliveNeighbors = (node) =>{
        let res = 0;
        for(let i in iterate){
            for(let j in iterate){
                if(iterate[i]==0 && iterate[j]==0) continue;
                let r = (grid[node].row + iterate[i] + rows)%rows;
                let c = (grid[node].col + iterate[j] + cols)%cols;
                let idx = _node(r , c ,cols);
                // if(idx >= rows*cols) console.log(node);
                if(new_grid[idx].Weight == wall_weight){
                    res++;
                }
            }
        }
        return res;
    }
    const Alive = (node, count) =>{
        switch (true){
            case(grid[node].Weight == wall_weight && (count==2 || count==3)):
                return wall_weight;
            case(grid[node].Weight == 1 && count==3):
                return wall_weight;
            default:
                return 1;
        }
    }

    for(let node in grid){
        let count = countAliveNeighbors(node);
        new_grid[node].Weight = Alive(node, count);
    }
    return new_grid;
}