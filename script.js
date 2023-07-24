let ix_dropdown = document.querySelector("#new-ix-dropdown");
let ix_add = document.querySelector("#add-ix");
let ix_list = document.querySelector("#ix-list");
window.compiled_ix = []

const enemy = [
    "none:---",
    "m:melee",
    "cp:camper with pistol",
    "cs:camper with shotgun",
    "bp:brawler with pistol",
    "bs:brawler with shotgun"
]

const item = [
    "none:---",
    "1:bottle",
    "2:pistol",
    "3:shotgun",
    "4:large pyramid",
    "5:tv",
    "6:flowers",
    "7:flask",
    "8:floppy disk",
    "9:teapot",
    "10:teddy bear",
    "11:mug",
    "12:skull"
]

const prop = [
    "none:---",
    "1:console",
    "2:cooling unit",
    "3:small grate",
    "4:white line",
    "5:doorway",
    "6:security camera",
    "7:helicopter",
    "8:grate",
    "9:grate 2",
    "10:rocket"
]

function refreshCompiled() {
    window.compiled_ix=[]
    Array.from(ix_list.childNodes).filter(a=>a.tagName=="LI").forEach((i)=>{
        let details = {
            "name": i.childNodes.item(0).textContent,
            "args": {
            }
        }
        let args= Array.from(i.childNodes.item(1).childNodes).filter(a=>a.tagName=="LI");
        args.forEach(a=>{
            details.args[a.getAttribute("argname")] = a.childNodes.item(1).value;
        })
        window.compiled_ix.push(details)
    })
}

function genAllIx() {
    let level = '';
    compiled_ix.forEach((i)=>{
        level = `${level}${genIx(i)}|`;
    })
    return level.substring(0,level.length-1)
}

function genIx(instrux) {
    let ix_record = ix.filter((a)=>a.name===instrux.name)[0];
    let toreturn = ix_record.format;
    Object.keys(instrux.args).forEach((k)=>{
        toreturn = toreturn.replaceAll(`{${k}}`,instrux.args[k]);
    })
    return toreturn
}

async function load() {
    window.ix = await (await fetch("/picohot.json")).json();
    ix.forEach(a => {
        let e = document.createElement("option");
        e.setAttribute("value",a.name);
        e.innerText = a.name;
        ix_dropdown.appendChild(e)
    });
}

function addIx(i,args) {
    let ix_record = ix.filter((a)=>a.name===i)[0];
    let li = document.createElement("li");
    li.classList.add("ix");
    let span = document.createElement("span");
    span.classList.add("ix-name");
    span.textContent = ix_record.name;
    let ul = document.createElement("ul");
    ul.classList.add("ix-args");
    Object.keys(ix_record.args).forEach((k,i)=>{
        let argli = document.createElement("li");
        argli.classList.add("ix-arg");
        argli.setAttribute("argname",k);
        arginpt = null
        switch (ix_record.args[k].type) {
            case "item":
                arginpt = document.createElement("select");
                item.forEach((a)=>{
                    let b = a.split(":");
                    let c = document.createElement("option");
                    c.setAttribute("value",b[0]);
                    c.textContent=b[1];
                    arginpt.appendChild(c);
                })
                break;
            case "enemy":
                arginpt = document.createElement("select");
                enemy.forEach((a)=>{
                    let b = a.split(":");
                    let c = document.createElement("option");
                    c.setAttribute("value",b[0]);
                    c.textContent=b[1];
                    arginpt.appendChild(c);
                })
                break;
            case "prop":
                arginpt = document.createElement("select");
                prop.forEach((a)=>{
                    let b = a.split(":");
                    let c = document.createElement("option");
                    c.setAttribute("value",b[0]);
                    c.textContent=b[1];
                    arginpt.appendChild(c);
                })
                break;
            default:
                arginpt = document.createElement("input");
                arginpt.setAttribute("type",ix_record.args[k].type);
                break;
        }
        let arglbl = document.createElement("label");
        arglbl.textContent=ix_record.args[k].desc;
        
        arginpt.addEventListener("change",refreshCompiled);
        if (args.length > 0) arginpt.value = args[i];
        if (ix_record.args[k].type === "number" && arginpt.value == "") arginpt.value = ix_record.args[k].default;

        argli.appendChild(arglbl);
        argli.appendChild(arginpt);
        ul.appendChild(argli);
    })
    let button = document.createElement("button");
    button.textContent="X";
    button.addEventListener("click",(e)=>{
        e.target.parentElement.remove();
        refreshCompiled();
    })
    li.appendChild(span);
    li.appendChild(ul);
    li.appendChild(button);
    ix_list.appendChild(li);
    refreshCompiled();
}

ix_add.addEventListener("click", ()=>{
    if(ix_dropdown.value == "none") return;
    addIx(ix_dropdown.value,[]);
    ix_dropdown.value="none";
});

window.addEventListener("load",load);
document.querySelector("#export-level").addEventListener("click",()=>{
    prompt("copy this code and insert it into the levels object",genAllIx());
});
document.querySelector("#import-level").addEventListener("click",()=>{
    let code = prompt("paste your level code here");
    ix_list.replaceChildren();
    code.split("|").forEach((i)=>{
        let splitted = i.split(":")
        let iname = splitted.shift();
        let args = splitted;
        let ix_record = ix.filter((a)=>a.format.split(":")[0] == iname)[0];
        addIx(ix_record.name,args)
    })
});