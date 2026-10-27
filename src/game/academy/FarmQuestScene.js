import Phaser from 'phaser';

export default class FarmQuestScene extends Phaser.Scene {
  constructor(config={}) { super('FarmQuestScene'); this.mission=config.mission; this.onEntitySelect=config.onEntitySelect; this.onReady=config.onReady; this.entitySprites={}; }
  create() { this.drawWorld(); this.createEntities(); this.onReady?.(); }
  drawWorld() {
    const {width,height}=this.scale;
    const g=this.add.graphics(); g.fillStyle(0xb7d49c,1); g.fillRoundedRect(20,18,width-40,height-36,28);
    g.fillStyle(0x9fc77f,.8); for(let i=0;i<18;i++){const x=55+(i*113)%Math.max(width-100,100),y=80+(i*71)%Math.max(height-150,100);g.fillCircle(x,y,3);g.fillCircle(x+9,y+4,2);}
    const path=this.add.graphics(); path.fillStyle(0xe7d19c,1); path.fillRoundedRect(width*.43,25,width*.14,height-50,25); path.fillRoundedRect(25,height*.42,width-50,height*.16,25);
    this.add.text(width/2,38,'KEBUN SIMULASI',{fontFamily:'Arial',fontSize:'15px',fontStyle:'bold',color:'#214d31',backgroundColor:'#f7f0dc',padding:{x:12,y:7}}).setOrigin(.5).setDepth(5);
  }
  createEntities() {
    const {width,height}=this.scale; const positions=[{x:width*.22,y:height*.30},{x:width*.73,y:height*.29},{x:width*.50,y:height*.72}];
    this.mission.entities.forEach((entity,index)=>{
      const p=positions[index%positions.length],group=this.add.container(p.x,p.y); group.add(this.add.ellipse(0,36,100,25,0x31552f,.16));
      const plot=this.add.graphics(); plot.fillStyle(0x76583c,1); plot.fillEllipse(0,12,105,52); plot.fillStyle(0x95734c,1); plot.fillEllipse(0,5,86,36); group.add(plot);
      const plant=this.add.graphics(); plant.fillStyle(0x4d8f43,1); plant.fillCircle(-18,-20,15);plant.fillCircle(7,-28,17);plant.fillCircle(23,-11,14);plant.fillStyle(0x79ad4b,1);plant.fillCircle(-2,-16,14);plant.fillRect(-4,-9,8,35);group.add(plant);
      group.add(this.add.text(0,55,entity.label,{fontFamily:'Arial',fontSize:'14px',fontStyle:'bold',color:'#173b27',backgroundColor:'#fffdf5',padding:{x:8,y:5}}).setOrigin(.5));
      group.add(this.add.circle(0,-54,11,0xffc928,.95)); group.setSize(125,125).setInteractive({useHandCursor:true});
      group.on('pointerdown',()=>this.selectEntity(entity.id,group)); this.entitySprites[entity.id]=group;
    });
  }
  selectEntity(id,group){Object.values(this.entitySprites).forEach(s=>s.setScale(1));group.setScale(1.07);this.onEntitySelect?.(id);}
  setOutcome(outcomeId){const choice=this.mission.choices.find(c=>c.id===outcomeId);if(!choice)return;const {width,height}=this.scale;const badge=this.add.text(width/2,height-45,choice.score>=80?'✓ KEPUTUSAN TEPAT':'↗ ADA PELAJARAN BARU',{fontFamily:'Arial',fontSize:'16px',fontStyle:'bold',color:'#fff',backgroundColor:choice.score>=80?'#267a46':'#b16c1e',padding:{x:18,y:10}}).setOrigin(.5).setDepth(20);this.tweens.add({targets:badge,y:height-58,duration:350,ease:'Back.out'});}
}