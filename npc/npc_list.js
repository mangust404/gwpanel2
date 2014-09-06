__panel.npc_list_island = {
  1: [ // G
    {id: 2, name: 'Hempy Trown', synd: 5867}, 
    {id: 3, name: 'Rusty Reefer', synd: 5867}, 
    {id: 6, name: 'Donnie Ray', synd: 5865},  
    {id: 8, name: 'Ricardo Gonzalez', synd: 5863},  
    {id: 10, name: 'Inamoto Kanushi', synd: 5862},  
    {id: 12, name: 'John Moretti', synd: 5866}
  ], 
  2: [ // Z
    {id: 1, name: 'Smokie Canablez', synd: 5867}, 
    {id: 4, name: 'Kenny Buzz', synd: 5867},  
    {id: 5, name: 'Yoshinori Watanabe', synd: 5862},  
    {id: 7, name: 'Rony James', synd: 5865},  
    {id: 9, name: 'Tommy Morales', synd: 5863}, 
    {id: 11, name: 'Tony Brandino', synd: 5866}
  ], 
  3: [ // P
    {id: 16, name: 'Takeshi Yamagata', synd: 5862}, 
    {id: 17, name: 'Michael Doyle', synd: 5865},  
    {id: 18, name: 'Alfonso Morales', synd: 5863},  
    {id: 19, name: 'Roy Fatico', synd: 5867},  
    {id: 20, name: 'Giovanni Greco', synd: 5866}
  ]
}

__panel.npc_list = [];
for(var island = 1; island < 4; island++) {
  jQuery(__panel.npc_list_island[island]).each(function() {
    __panel.npc_list.push(this);
  });
}

__panel.npc_list_g = {};

jQuery(__panel.npc_list_island[1]).each(function() {
  __panel.npc_list_g[this.id] = this.name;
});

__panel.npc_list_z = {};

jQuery(__panel.npc_list_island[2]).each(function() {
  __panel.npc_list_z[this.id] = this.name;
});

__panel.npc_list_p = {};

jQuery(__panel.npc_list_island[3]).each(function() {
  __panel.npc_list_p[this.id] = this.name;
});