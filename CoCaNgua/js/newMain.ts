const keyPosition = {
	last : [55, 13, 27, 41],
	first : [0, 14, 28, 42],
};
const thinkTime = 1;
const $ = (selector:string) => document.querySelectorAll(selector); //jQuery LUL
const trunc = (x:number) => (x + 56) % 56;
const randomDiceRoll = () => Math.floor(Math.random() * 6) + 1;
const log = (name:string) => console.log(`Something went wrong with '${name}'`);
class Box {
	private readonly _DOM:any;
	private readonly _class:string;
	private _sclickFunc:Function[] = [];
	private _pawn:number;
	private readonly _maxPawn:number;
	constructor(private _position:number, private _team:number = -1) {
		this._DOM = this.getDOM();
		this._class = this._DOM.className;
		this._pawn = (_position === -7)? 4 : 0;
		this._maxPawn = (_position === -7)? 4 : 1;
	}
	get DOM():any {
		return this._DOM;
	}
	get class():string {
		return this._class;
	}
	get sclickFunc():Function[] {
		return this._sclickFunc;
	}
	get position():number {
		return this._position;
	}
	get team():number {
		return this._team;
	}
	get pawn():number {
		return this._pawn;
	}
	get maxPawn():number {
		return this._maxPawn;
	}
	addPawn(team:number):boolean {
		if (this.pawn === this.maxPawn || team < 0 || team >= 4)
			return false;
		this._team = team;
		if (this.class.indexOf('pos') >= 0 || 
		this.class.indexOf('chuong') >= 0){
			this.DOM.style.backgroundImage = 'url(images/horse' + this.team + '.svg)';
			this._pawn++;
			return true;
		}
		if (this.class.indexOf('home') >= 0) {
			this.DOM.innerHTML += '<img src="images/horse' + this.team + '.svg">';
			this._pawn++;
			return true;
		}
		log('moveto');
		return false;
	}
	removePawn():boolean {
		if (this.pawn === 0)
			return false;
		if (this.position > -7){
			this.DOM.style.backgroundImage = 'none';
			this._pawn--;
			if (keyPosition.first.indexOf(this.position) >= 0) {
				this.DOM.style.backgroundImage = 
				`url(images/arrow${this.position / 14}.svg)`;
			}
			return true;
		}
		if (this.class.indexOf('home') >= 0) {
			this.DOM.removeChild(this.DOM.firstChild);
			this._pawn--;
			return true;
		}
		log('moveto');
		return false;
	}
	clickState(state:boolean):void {
		this.DOM.onclick = state? () => this.DOM.dispatchEvent(new CustomEvent('sclick')) : {};
	}
	addSclick(func:Function):void {
		this._sclickFunc.push(func);
		this.DOM.addEventListener('sclick', 
			this.sclickFunc[this.sclickFunc.length - 1]);
	}
	removeSclick():void {
		if (this.sclickFunc)
			for (let f of this.sclickFunc)
			this._DOM.removeEventListener('sclick', f);
		this._sclickFunc = [];
	}
	sclick():void {
		this.DOM.dispatchEvent(new CustomEvent('sclick'));
	}
	changeLight(mode:number):boolean {
		if (mode === 0) {this.DOM.style.filter = 'brightness(100%)'; return true}
		if (mode === 1) {this.DOM.style.filter = 'brightness(85%)'; return true}
		if (mode === 2) {this.DOM.style.filter = 'brightness(70%)'; return true}
		log('changeLight');
		return false;
	}
	private getDOM():any {
		if (this.position === -8)
			return $('.dice')[0];
		if (this.position === -7) 
			return $('.home' + this.team)[0];
		if (this.position < 0)
			return $('.chuong' + this.team + -this.position)[0];
		if (this.position >= 0 && this.position < 56)
			return $('.pos' + this.position)[0];
		log('getDom');
		return null;
	}
}

let boxes:Box[] = [];
let pawnPos:number[][] = [[-7,-7,-7,-7], [-7,-7,-7,-7], [-7,-7,-7,-7], [-7,-7,-7,-7]];
let dices:number[] = [];
let currentTeam = 0, players = 1;

function play(team:number, turn:number):boolean {
	if (!fullCheck(team)) {
		nextTurn();
		return false;
	}
	diceOnSclick(false);
	for (let pos of pawnPos[team]) {
		if (emphasize(team, pos, dices).length > 0) {
			getBox(pos, team).addSclick(() => {
				resetDisplay();
				let goodToGo = emphasize(team, pos, dices);
				for (let des of goodToGo) {
					getBox(des, team).addSclick(() => {
						if (check(team, pos, 6) === des) dices.splice(0, 1);
						else dices.pop();
						--turn;
						move(team, pos, des);
						resetDisplay();
						clearSclick();
						if (turn === 0) nextTurn();
						else play(team, turn);
					})
				}
			})
		}
	}
	if (team >= players) {
		think(team, dices, pawnPos);
	}
	return true;
}

function think(team:number, dices:number[], positions:number[][]):void {
	// console.log(`think(${team},[${dices}],[${positions}])`);
	let dice = dices[dices.length - 1];
	let wayToGo:number[][] = [];
	for (let pos of positions[team]) {
		let checkValue = [check(team, pos, dice)];
		if (dice !== dices[0]) checkValue.push(check(team, pos, 6));
		if (dice === 1 && pos >= 0) 
			checkValue.push(check(team, pos, nearestLastDice(pos)));
		for (let val of checkValue) 
			if (val !== null) wayToGo.push([pos,val]);
	}
	let wayToGoPoints = benchmark(team, wayToGo);
	let points:number[] = [];
	for (let val of wayToGoPoints)
		points.push(val[2]);
	let choice = wayToGo[chooseBestNumber(points)];
	setTimeout(() => {
		// console.log(`choice[0].sclick:choice=[${choice}]`);
		let box:Box = getBox(choice[0], team);
		box.sclick();
		if (choice[1] > -8)
			setTimeout(() => {
				// console.log(`choice[1].sclick:choice=[${choice}]`);
				let box = getBox(choice[1], team);
				box.sclick();
			}, thinkTime);
	}, thinkTime);

	function chooseBestNumber(arr:number[]):number {
	    let newarr = arr.slice(0), sum = 0
	      , sumArr = [];
	    newarr.sort(function(a, b) {
	        return a - b
	    });
	    for (let val of newarr) {
	        sum += val;
	        sumArr.push(sum);
	    }
	    let r = Math.round(Math.random() * sum)
	      , i = 0;
	    while (r > sumArr[i])
	        i++;
        return arr.indexOf(newarr[i]);
	}

	function benchmark(team:number, wayToGo:number[][]):number[][] {
		// console.log(`waytogo=[${wayToGo}]`);
	    for (let way of wayToGo) {
	        if (way[1] < 0 && way[1] > -7)
	            way.push(80 * -way[1] - 79);
	        else if (way[1] === keyPosition.last[team])
	            way.push(120);
	        else if (way[1] === keyPosition.first[team])
	            way.push(60);
	        else {
	            if (exist(way[1]))
	                way.push(40 + 3 * trunc(way[1] - way[1]));
	            else if (way[1] == keyPosition.last[team] - 1)
	                way.push(0);
	            else
	                way.push(trunc(way[1] - way[0]));
	        }
	    }
	    let i = 0;
	    while (i < wayToGo.length && wayToGo[i][2] < 6)
	    	++i;
	    if (i === wayToGo.length) wayToGo.push([-8, -8, 1]);
	    return wayToGo;
	}
}

function exist(pos:number, team:number = 4):boolean {
	if (team === 4) {
		for (let team = 0; team < 4; ++team)
			if (pawnPos[team].indexOf(pos) >= 0)
				return true;
		return false;
	}
	return pawnPos[team].indexOf(pos) >= 0;

}

function nextTurn():void {
	resetDisplay();
	dices = [];
	if (win(currentTeam)) {
		diceOnSclick(false);
		clearSclick();
		let replay = confirm(`Team ${currentTeam + 1} win, vant to play again?`);
		clearSclick();
		if (replay == true) location.reload();
		else alert(`I'm out!`);
	} else setTimeout(() => {
		clearSclick();
		currentTeam = (currentTeam + 1) % 4;
		moveDice(currentTeam);
		$('.ketqua')[0].innerHTML = '';
		rollDice();
	}, thinkTime);
}

function diceOnSclick(on:boolean):void {
	getBox(-8).removeSclick();
	if (on) getBox(-8).addSclick(rollDice);
	else getBox(-8).addSclick(nextTurn);
}

function win(team:number):boolean {
	for (let pos of pawnPos[team]) 
		if (pos != -3 && pos != -4 && pos != -5 && pos != -6)
            return false;
    return true;
}

function emphasize(team:number, pos:number, dices:number[]):number[] {
	let dice = dices[dices.length - 1];
	let checkValue = [check(team, pos, dice)];
	let goodToGo:number[] = [];
	if (dice !== dices[0]) checkValue.push(check(team, pos, 6));
	if (dice === 1 && pos >= 0) 
		checkValue.push(check(team, pos, nearestLastDice(pos)));
	for (let val of checkValue) {
		if (val !== null) {
			getBox(pos, team).changeLight(2);
			getBox(val, team).changeLight(1);
			goodToGo.push(val);
		}
	}
	return goodToGo;
}

function nearestLastDice(pos:number):number {
	if (pos < 0) return -1;
	return pos % 14 == 13 ? 14 : 13 - pos % 14;
}

function clearSclick():void {
	for (let box of boxes) {
		box.removeSclick();
	}
}

function clickListener(state:boolean):void {
	for (let box of boxes) {
		box.clickState(state);
	}
}

function rollDice():void {
	diceOnSclick(false);
	if (currentTeam < players) clickListener(true);
	else clickListener(false);
	showDices(currentTeam, dices);
	let r:number = randomDiceRoll();
	//let sound = diceSound();
	//sound.play();
	//sound.onloadedmetadata = () => setTimeout(() => {
		dices.push(r);
		if (r === 6) rollDice();
		else {
			showDices(currentTeam, dices);
			play(currentTeam, dices.length);
		}
	//}, sound.duration * 1000);	
}

function showDices(team:number, dices:number[]):void {
	let kq = $('.ketqua')[0];
	kq.innerHTML = '';
	for (let dice of dices)
		kq.innerHTML += dice + ' ';
}

function getBox(position:number, team?:number):Box {
	if (position === -8) {
		return boxes[boxes.length - 1];
    } else if (position < 0) {
        for (let box of boxes) {
            if (box.position === position && box.team === team) return box;
        }
    } else {
        for (let box of boxes) {
            if (box.position === position) return box;
        }
    }
	log('getBox');
	return boxes[0]; // this will never come except position > max position
}

function getPositions():number[][] {
	let positions:number[][] = [[],[],[],[]];
	for (let box of boxes) {
		if (box.pawn > 0) 
			for (let i = 0; i < box.pawn; ++i) {
				positions[box.team].push(box.position);
			}
	}
	return positions;
}

function fullCheck(team:number):boolean {
	for (let dice of dices)
		for (let i = 0; i < 4; ++i) {
			if (check(team, pawnPos[team][i], dice) !== null)
				return true;
		}
		return false;
}

function check(team:number, pos:number, dice:number):number|null {
	let positions = getPositions();
	if (pos === -7) {
		if (dice !== 6) return null;
		if ((<any>(positions[team])).indexOf(keyPosition.first[team]) >= 0) 
			return null;
		return keyPosition.first[team];
	} 
	if (pos < 0) {
		if (-dice !== pos - 1 || exist(pos - 1, team)) return null;
		return -dice;
	}
	if (pos === keyPosition.last[team]) {
		for (let i = 1; i <= dice; ++i)
			if (positions[team].indexOf(-i) >= 0) return null;
		return -dice;
	}
	if (pos >= 0 && pos < 56) {
		let nearest = getNearestPositionAndDistant(team, pos, positions);
		if (nearest.distant < dice) return null;
		if (nearest.distant === dice && 
		((<any>positions[team]).indexOf(trunc(pos + dice)) >= 0)) return null;
		return trunc(pos + dice);
	}
	log('check');
	return null;
	// Local functions
	interface positionAndDistant {
		position:number,
		distant:number,
	}
	function getNearestPositionAndDistant(team:number, 
	position:number, 
	positions:number[][]):positionAndDistant {
		let nearest = keyPosition.last[team];
        for (let i = 0; i < 4; ++i)
			for (let j = 0; j < 4; ++j) {
				if (positions[i][j] < 0) continue;
				let d = distant(team, positions[i][j], position);
				if (d < distant(team, nearest, position) && d > 0)
					nearest = positions[i][j];
			}
		return {position: nearest, distant: distant(team, nearest, position)};
	}
	function distant(team:number,x:number, y:number):number {
		let posx = trunc((x - keyPosition.first[team] + 56));
		let posy = trunc((y - keyPosition.first[team] + 56));
		return posx - posy;
	}
}

function move(team:number, src:number, des:number):void {
	let sound = new Audio('sound/dc1.wav');
		sound.play().catch(e => console.log(e));
	if (des >= 0) kill(des);
	getBox(src, team).removePawn();
	getBox(des, team).addPawn(team);
	for (let i = 0; i < 4; ++i) 
		if (pawnPos[team][i] === getBox(src, team).position) {
			pawnPos[team][i] = getBox(des, team).position;
		}
}

function kill(pos:number):void {
	let box = getBox(pos);
	if (box.pawn === 1) {
		let sound = new Audio('sound/ngoec.wav');
		sound.play().catch(e => console.log(e));
		move(box.team, pos, -7);
	}
}

function setup():void {
	paint();
	moveDice(0);
	const DOMs:any = $('div');
	for (let i = 3; i <=87; ++i){
		DOMs[i].style.gridArea = DOMs[i].className; // CSS
		if(DOMs[i].className.indexOf("chuong0") >= 0 || 
		DOMs[i].className.indexOf("chuong2") >= 0 || 
		DOMs[i].className.indexOf("55") >= 0 || 
		DOMs[i].className.indexOf("27") >= 0) {
			DOMs[i].style.backgroundSize = 'auto 100%';
		}
	}
    for (let team = 0; team < 4; ++team) {
		boxes.push(new Box(-7, team));
	}
	for (let i = 4; i < 60; ++i) {
		boxes.push(new Box(i - 4));
	}
	for (let team = 0; team < 4; ++team)
		for (let i = 0; i < 6; ++i) {
			boxes.push(new Box(-i - 1, team));
		}
	boxes.push(new Box(-8));
	diceOnSclick(true);
	(<any>$('.nowhere')[0]).onclick = () => location.reload();
	document.onkeyup = (e) => {
		if (e.key == 'Enter') (<any>$('.dice')[0]).click();
		else if (e.key == 'Escape') nextTurn();
	}
}

function paint():void {
	const colors = [
	['rgb(100,100,225)','rgb(160,160,225)'],
	['rgb(100,225,100)','rgb(160,225,160)'],
	['rgb(225,100,100)','rgb(255,160,160)'],
	['rgb(225,225,0)','rgb(225,225,120)']];
	for (let i = 0; i < 4; i++){
		let first:any = $('.pos' + (14 * i))[0];
		first.style.backgroundColor = colors[i][0];
		first.onmouseenter = () => first.style.backgroundColor = colors[i][1];
		first.onmouseleave = () => first.style.backgroundColor = colors[i][0];
        for (let k = 0; k < 4; k++){
        	let home:any = $('.home' + k)[0];
            home.onmouseenter = () => home.style.filter = 'saturate(130%)';
            home.onmouseleave = () => home.style.filter = 'saturate(100%)';
        }
		for (let j = 1; j <= 6; j++){
			let stop:any = $('.chuong' + i + j)[0];
			stop.style.backgroundColor = colors[i][0];
			stop.onmouseenter = () => stop.style.backgroundColor = colors[i][1];
			stop.onmouseleave = () => stop.style.backgroundColor = colors[i][0];
		}
	}
}

function resetDisplay():void {
	for (let box of boxes) {
		box.changeLight(0);
	}
}

function moveDice(team:number):boolean {
	if (team >= 4 || team < 0) {
		log('moveDice');
		return false;
	}
    let ketQua:any = $('.ketqua')[0],
	    control:any = $('.controls')[0];
    switch (team) {
        case 0:
            control.style.top = '3%';
            control.style.left = '5%';
            ketQua.style.direction = 'ltr';
            return true;
        case 1:
            control.style.top = '65%';
            control.style.left = '5%';
            ketQua.style.direction = 'ltr';
            return true;
        case 2:
            control.style.top = '65%';
            control.style.left = '75%';
            ketQua.style.direction = 'rtl';
            return true;
		default:
            control.style.top = '3%';
            control.style.left = '75%';
            ketQua.style.direction = 'rtl';
            return true;
    }
}

function drawHomePage(){
    $('.table-container')[0].innerHTML = `<div class="openpage">
    	<p class="game-title fontlarge">CỜ CÁ NGỰA</p>
    	<div class="gamemode fontmedium">
    		<a onclick="drawBoard(1)">⏵ 1 người đấu 3 máy</a> <br>
    		<a onclick="drawBoard(0)">⏵ Xem 4 máy đấu với nhau</a>
    	</div>
    </div>`;
}
function drawBoard(playersNumber:number = 0){
    $('.table-container')[0].innerHTML = '<div class="table"><div class="home0"><img src="images/horse0.svg"><img src="images/horse0.svg"><img src="images/horse0.svg"><img src="images/horse0.svg"></div><div class="home3"><img src="images/horse3.svg"><img src="images/horse3.svg"><img src="images/horse3.svg"><img src="images/horse3.svg"></div><div class="home1"><img src="images/horse1.svg"><img src="images/horse1.svg"><img src="images/horse1.svg"><img src="images/horse1.svg"></div><div class="home2"><img src="images/horse2.svg"><img src="images/horse2.svg"><img src="images/horse2.svg"><img src="images/horse2.svg"></div><div class="pos0" style="background-image: url(images/arrow0.svg)"></div><div class="pos1"></div><div class="pos2"></div><div class="pos3"></div><div class="pos4"></div><div class="pos5"></div><div class="pos6"></div><div class="pos7"></div><div class="pos8"></div><div class="pos9"></div><div class="pos10"></div><div class="pos11"></div><div class="pos12"></div><div class="pos13"></div><div class="pos14" style="background-image: url(images/arrow1.svg)"></div><div class="pos15"></div><div class="pos16"></div><div class="pos17"></div><div class="pos18"></div><div class="pos19"></div><div class="pos20"></div><div class="pos21"></div><div class="pos22"></div><div class="pos23"></div><div class="pos24"></div><div class="pos25"></div><div class="pos26"></div><div class="pos27"></div><div class="pos28" style="background-image: url(images/arrow2.svg)"></div><div class="pos29"></div><div class="pos30"></div><div class="pos31"></div><div class="pos32"></div><div class="pos33"></div><div class="pos34"></div><div class="pos35"></div><div class="pos36"></div><div class="pos37"></div><div class="pos38"></div><div class="pos39"></div><div class="pos40"></div><div class="pos41"></div><div class="pos42" style="background-image: url(images/arrow3.svg)"></div><div class="pos43"></div><div class="pos44"></div><div class="pos45"></div><div class="pos46"></div><div class="pos47"></div><div class="pos48"></div><div class="pos49"></div><div class="pos50"></div><div class="pos51"></div><div class="pos52"></div><div class="pos53"></div><div class="pos54"></div><div class="pos55"></div><div class="chuong11"></div><div class="chuong12"></div><div class="chuong13"></div><div class="chuong14"></div><div class="chuong15"></div><div class="chuong16"></div><div class="chuong31"></div><div class="chuong32"></div><div class="chuong33"></div><div class="chuong34"></div><div class="chuong35"></div><div class="chuong36"></div><div class="chuong01"></div><div class="chuong02"></div><div class="chuong03"></div><div class="chuong04"></div><div class="chuong05"></div><div class="chuong06"></div><div class="chuong21"></div><div class="chuong22"></div><div class="chuong23"></div><div class="chuong24"></div><div class="chuong25"></div><div class="chuong26"></div><div class="nowhere"></div></div><div class="controls" style="position: fixed;"><img src="images/dice.svg" alt="Xóc đĩa" class="dice fontmedium"><div class="ketqua fontmedium"></div></div>';
	players = playersNumber;
	setup();
	clickListener(true);
	if (playersNumber === 0) {
		clickListener(false);
		rollDice();
	}
}
drawHomePage();