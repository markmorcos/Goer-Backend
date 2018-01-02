import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';

import { ResourceService } from '../../resource.service';
import { ConstantService } from '../../constant.service';

import * as fields from '../resources.model';

@Component({
  selector: 'app-resource-form',
  templateUrl: './resource-form.component.html',
  styleUrls: ['./resource-form.component.css']
})
export class ResourceFormComponent implements OnInit {
  model: string;
  fields: any;
  form: FormGroup;
  action = 'add';
  loading = false;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private resourceService: ResourceService,
              private constantService: ConstantService) { }

  ngOnInit() {
    this.route.parent.params.subscribe(params => {
      this.model = params.model;
      this.fields = fields[params.model];
      const formGroup = {};
      for (const field of fields[params.model]) {
        formGroup[field.name] = new FormControl('');
      }
      this.form = new FormGroup(formGroup);
      const { id } = this.route.snapshot.params;
      if (id) {
        this.action = 'edit';
        this.loading = true;
        this.resourceService.getResource(params.model, id).subscribe(
          resource => {
            this.constantService.setError('');
            this.loading = false;
            delete resource._id;
            delete resource.__v;
            this.form.patchValue(resource);
          },
          response => {
            this.loading = false;
            if (response.status === 404) {
              this.router.navigate(['/', params.model], { relativeTo: this.route });
            }
          }
        );
      }
    });
  }

  onSubmit() {
    this.loading = true;
    const { id } = this.route.snapshot.params;
    this.resourceService.saveResource(this.model, id, this.form.value).subscribe(
      resource => {
        this.constantService.setError('');
        this.loading = false;
        this.router.navigate(['/', this.model, resource._id], { relativeTo: this.route });
      },
      response => {
        this.loading = false;
        this.constantService.setError(response.error.message);
      }
    );
  }

  onCancel() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}
