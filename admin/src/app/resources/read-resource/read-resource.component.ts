import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ResourceService } from '../../resource.service';
import { ConstantService } from '../../constant.service';

import * as fields from '../resources.model';

@Component({
  selector: 'app-read-resource',
  templateUrl: './read-resource.component.html',
  styleUrls: ['./read-resource.component.css']
})
export class ReadResourceComponent implements OnInit {
  model: string;
  fields: any;
  resource: any;
  loading = true;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private resourceService: ResourceService,
              private constantService: ConstantService) { }

  ngOnInit() {
    this.model = this.route.parent.snapshot.params.model;
    this.route.parent.params.subscribe(params => {
      this.model = params.model;
      this.fields = fields[params.model];
    });
    this.resourceService.getResource(this.model, this.route.snapshot.params.id).subscribe(
      resource => {
        this.constantService.setError('');
        this.loading = false;
        this.resource = resource;
      },
      response => {
        this.loading = false;
        this.constantService.setError(response.error.message);
      }
    );
  }

  onDelete() {
    if (confirm('Are you sure you want to delete this item?')) {
      this.loading = true;
      const { model } = this.route.parent.snapshot.params;
      const { id } = this.route.snapshot.params;
      this.resourceService.deleteResource(model, id).subscribe(
        success => {
          this.constantService.setError('');
          this.router.navigate(['..'], { relativeTo: this.route });
        },
        response => {
          this.loading = false;
          this.constantService.setError(response.error.message);
        }
      );
    }
  }
}
