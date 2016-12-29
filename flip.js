var size = 0;
var qsize = 0;
var matrix = [];
var b_vector = [];
var gamemode = false;

function clear_debug(){
	var d = document.getElementById('debug');
	while(d.firstChild){
		d.removeChild(d.firstChild);
	}
	debuglog("Ax = b", true);
}

function td_handler2(y,x){
	var td = document.getElementById(td_id(y,x));
	if(td.style.backgroundColor == 'white'){
		td.style.backgroundColor = 'black';
		td.style.color = 'white';
	}else{
		td.style.backgroundColor = 'white';
		td.style.color = 'black';
	}
}

function td_handler(y,x){
	td_handler2(y,x);
	if(gamemode == true){
		if(y-1 >= 0){
			td_handler2(y-1,x);
		}
		if(y+1 < size){
			td_handler2(y+1,x);
		}
		if(x-1 >= 0){
			td_handler2(y,x-1);
		}
		if(x+1 < size){
			td_handler2(y,x+1);
		}
	}
}

function error(msg){
	var d = document.getElementById('debug');
	var l = document.createElement('li');
	var t = document.createTextNode(msg);
	l.appendChild(t);
	d.appendChild(l);
}

function change_gamemode(cb){
	gamemode = cb.checked;
}

function debuglog(msg, always = false){
	var dcheck = document.getElementById('debug_checkbox');
	if(dcheck.checked || always){
		error(msg);
	}
}

function dump_matrix(){
	debuglog("Matrix A:");
	var x,y,s;
	for(y = 0; y < qsize; y++){
		s='';
		for(x = 0; x < qsize; x++){
			s += matrix[mat_pos(y,x)] + ' ';
		}
		debuglog(s);
	}

}

function swap_lines(y1,y2){
	var x;
	var tmp;

	if(y1 == y2) return;

	for(x = 0; x < qsize; x++){
		tmp = matrix[mat_pos(y1,x)];
		matrix[mat_pos(y1,x)] = matrix[mat_pos(y2,x)];
		matrix[mat_pos(y2,x)] = tmp;
	}

	tmp = b_vector[y1];
	b_vector[y1] = b_vector[y2];
	b_vector[y2] = tmp;
}

function build_matrix(){
	var i,j,x,y;

	matrix = [];
	for(i = 0; i < size; i++){
		for(j = 0; j < size; j++){
			for(y = 0; y < size; y++){
				for(x = 0; x < size; x++){
					var val = 0;
					if(x == j && y == i){
						val = 1;
					}else if(x > 0 && x-1 == j && y == i){
						val = 1;
					}else if(x < size-1 && x+1 == j && y == i){
						val = 1;
					}else if(y > 0 && x == j && y-1 == i){
						val = 1;
					}else if(y < size-1 && x == j && y+1 == i){
						val = 1;
					}
					matrix.push(val);
				}
			}
		}
	}
}

function td_id(i,j){
	return "td_"+i+"_"+j;
}

function board_reset(){
	var t = document.getElementById('tabul');
	while(tabul.firstChild){
		tabul.removeChild(tabul.firstChild);
	}

	t.style.width = '100%';
	t.style.minHeight = '400px';
	t.style.tableLayout='fixed';

	var i,j;
	for(i = 0; i < size; i++){
		var tr = document.createElement("tr");
		for(j = 0; j < size; j++){
			var td = document.createElement("td");
			td.style.backgroundColor='white';
			td.setAttribute("id", td_id(i,j));
			td.setAttribute("onclick", "td_handler("+i+","+j+")");
			tr.appendChild(td);
		}
		t.appendChild(tr);
	}
	clear_debug();
}

function invert(){
	var x,y;
	for(y = 0; y < size; y++){
		for(x = 0; x < size; x++){
			td_handler2(y,x);
		}
	}
}

function set_size(){
	size = parseInt(document.getElementById('size').value);
	if(size < 3 || size > 50){
		alert("unsupported size!");
		size = 0;
		return;
	}
	qsize = size*size;

	board_reset();
}
function dump_vector(name,vec){
	var i, s = name + ': [';
	for(i = 0; i < vec.length; i++){
		s += vec[i] + ' ';
	}
	debuglog(s+']');
}

function build_b_vector(){
	var i,j;

	b_vector = [];
	for(i = 0; i < size; i++){
		for(j = 0; j < size; j++){
			var td = document.getElementById(td_id(i,j));
			var val = td.style.backgroundColor == 'black' ? 1 : 0;
			b_vector.push(val);
		}
	}
}

function mat_pos(y,x){
	return y*qsize + x;
}
function xor(a,b){
	return (a && !b) || (!a && b) ? 1 : 0;
}

function prefix(k){
	var n;
	for(n = 0; matrix[mat_pos(k,n)] == 0 && n < qsize; n++);
	return n;
}

function eliminate(i){
	var k, n;
	for(k = i+1; k < qsize; k++){
		if(matrix[mat_pos(k,i)] == 0) continue;

		/* eliminate... */
		/* debuglog("XOR "+k+" with "+i+"<br>"); */
		for(n = 0; n < qsize; n++){
			matrix[mat_pos(k,n)] = xor(matrix[mat_pos(k,n)], matrix[mat_pos(i,n)]);
		}
		b_vector[k] = xor(b_vector[k], b_vector[i]);
	}
}

function findline(n){
	var k;
	for(k = 0; k < qsize; k++){
		if(matrix[mat_pos(k, n)] == 1 && prefix(k) == n){
			return k;
		}
	}
}

function gauss(){
	var n;
	for(n = 0; n < qsize-1; n++){
		var k = findline(n);

		/* k is used as line n */

		if(k !== undefined){
			/* debuglog("swap "+n+" <-> "+k+"<br>"); */

			/* swap them */
			swap_lines(n, k);
			eliminate(n);
		}
	}
}

function setX(y,x,yes){
	var td = document.getElementById(td_id(y,x));
	td.innerText = yes ? "X" : "";
}

function eliminate_freedom(){
	var x,y,d=0;
	for(y = 0; y < qsize; y++){
		for(x = 0; x < qsize; x++){
			if(matrix[mat_pos(y,x)] != 0)
				break;
		}
		if(x == qsize){
			if(b_vector[y] != 0){
				error("NOT SOLVABLE!");
				return -1;
			}
			matrix[mat_pos(y,y)] = 1;
			d++;
		}
	}
	return d;
}

function solve()
{
	build_matrix();
	build_b_vector();

	debuglog("");
	debuglog("Pre Gauss");
	dump_matrix();
	dump_vector("vector b", b_vector);
	debuglog("");

	gauss();

	debuglog("");
	debuglog("After Gauss");
	dump_matrix();
	dump_vector("vector b", b_vector);
	debuglog("");

	var d = eliminate_freedom();
	if(d == -1){
		return;
	}

	debuglog("degrees of freedom: "+d);

	var n;

	var tds = document.getElementsByTagName('td');
	for(n = 0; n < tds.length; n++){
		tds[n].innerText='';
	}

	var press = [];
	for(n = 0; n < press.length; n++){
		press[n] = 0;
	}

	for(n = qsize-1; n >= 0; n--){
		var b = b_vector[n], i;

		for(i = n+1; i < qsize; i++){
			b = xor(b, matrix[mat_pos(n,i)]*press[i]);
		}
		press[n] = b;

		var x = n % size;
		var y = Math.floor(n / size);
		setX(y,x,b);
	}
	dump_vector("vector x", press);
}

