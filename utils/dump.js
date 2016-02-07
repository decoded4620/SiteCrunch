//======================================================================================================================
//Dumper implementation
//======================================================================================================================

Dumper.prototype.dump = dump;

function Dumper() {
 this.depth = 0;
}

function dump(o, maxDepth) {
 ++this.depth;

 if (this.depth >= maxDepth) {
     console.log("max depth (" + this.depth + ") reached!");
     console.log(o);
     --this.depth;
     return;
 }
 var objtype = typeof o;
 console.log(this.depth + ') - dump: [' + o + '] type: ' + objtype);
 if (objtype === 'object') {
     var cnt = 0;
     for ( var prop in o) {
         cnt++;
         var value = o[prop];
         var type = (typeof value);
         console.log(this.depth + ")\t" + prop + "=" + value + "(" + type + ")");

         if (type === 'object') {
             this.dump(value, maxDepth);
         }
     }

     if (cnt == 0) {
         console.log(this.depth + ")\t\tobject has no properties");
     }
 }
 --this.depth;
};

module.exports.Dumper = Dumper;
