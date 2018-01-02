import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ResourceService } from '../../resource.service';
import { ConstantService } from '../../constant.service';

import * as fields from '../resources.model';

@Component({
  selector: 'app-list-resources',
  templateUrl: './list-resources.component.html',
  styleUrls: ['./list-resources.component.css']
})
export class ListResourcesComponent implements OnInit {
  model: string;
  fields: any;
  resources = [];
  loading = false;

  constructor(private route: ActivatedRoute,
              private resourceService: ResourceService,
              private constantService: ConstantService) { }

  listResources() {
    this.loading = true;
    this.resourceService.getResources(this.model).subscribe(
      resources => {
        this.constantService.setError('');
        this.loading = false;
        this.resources = resources;
      },
      response => {
        this.loading = false;
        this.constantService.setError(response.error.message);
      }
    );
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.model = params.model;
      this.fields = fields[params.model];
      this.listResources();
    });
  }

  onDelete(id: string) {
    if (confirm('Are you sure you want to delete this item?')) {
      this.loading = true;
      this.resourceService.deleteResource(this.model, id).subscribe(
        success => {
          this.constantService.setError('');
          this.listResources();
        },
        response => {
          this.loading = false;
          this.constantService.setError(response.error.message);
        }
      );
    }
  }
}
