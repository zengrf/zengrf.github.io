import {solve} from './geometry.mjs';
self.onmessage=({data})=>{try{self.postMessage({id:data.id,result:solve(data.spheres)});}catch(e){self.postMessage({id:data.id,error:e.message});}};
