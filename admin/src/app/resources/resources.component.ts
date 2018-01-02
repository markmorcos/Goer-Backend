import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import * as fields from './resources.model';

@Component({
  selector: 'app-resources',
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.css']
})
export class ResourcesComponent implements OnInit {
  title = '';
  model: string;
  fields: any;

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.title = params.model.charAt(0).toUpperCase() + params.model.slice(1);
      this.model = params.model;
      this.fields = fields[params.model];
    });
  }

  ngOnInit() {
  }
}
