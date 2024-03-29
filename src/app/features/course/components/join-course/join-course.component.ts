import { CourseService } from '../../services';
import { AppRoutesEnum } from '@core/enums';
import { JoinCourseResponse } from './interfaces';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { debounceTime, Observable, Subject, takeUntil } from 'rxjs';
import { JoinCourseStatusResponse } from './enums';
import { CourseApi } from '../../apis';
import { CourseItem } from '../../interfaces';

@Component({
  selector: 'app-join-course',
  templateUrl: './join-course.component.html',
  styleUrls: ['./join-course.component.scss']
})
export class JoinCourseComponent implements OnInit {
  public courseList!: Observable<CourseItem[]>;
  public form!: FormGroup;
  public validatorsLength: { searchFieldMax: number } = {
    searchFieldMax: 6,
  };
  public status!: JoinCourseStatusResponse;

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private modalRef: MatDialogRef<JoinCourseComponent>,
    private router: Router,
    private courseService: CourseService,
    private courseApi: CourseApi
  ) { }

  ngOnInit(): void {
    this.initCourseList();
    this.initForm();
  }

  private initCourseList() {
    this.courseList = this.courseService.allCourses$;
  }
  private initForm() {
    this.form = new FormGroup({
      searchField: new FormControl('', [Validators.required, Validators.maxLength(this.validatorsLength.searchFieldMax)])
    })
  }

  public onSubmit() {
    if (this.form.invalid) return;

    const courseKey = this.form.value['searchField'];
    this.courseApi.addUserToCourse(courseKey)
      .pipe(takeUntil(this.destroy$))
      .pipe(debounceTime(1000))
      .subscribe({
        next: (response: JoinCourseResponse<any>) => {
          this.status = response.status;
          this.router.navigate(['/', AppRoutesEnum.Student, 'course', response.response.course.id]);
          this.modalRef.close();
        },
        error: (error) => {
          this.status = JoinCourseStatusResponse.FAILED;
          console.log(error);
          this.form.get('searchField')?.setErrors({ incorrect: true });
        },
      })

  }

  public get searchField() {
    return this.form.get('searchField') as FormControl;
  }
  public get invalidCourseKeyAppearance() {
    return this.searchField.errors?.['incorrect'] && this.status == JoinCourseStatusResponse.FAILED;
  }
  public get hintLabel() {
    return `${this.form.get('searchField')?.value.length}/${this.validatorsLength.searchFieldMax}`
  }
  public get errorMessage() {
    const control = this.searchField;
    if (control?.errors?.['required']) return 'The field cannot be empty';
    else if (control?.errors?.['maxlength']?.['requiredLength']) return `Max length is ${control?.errors?.['maxlength']?.['requiredLength']}`;
    else return '';
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
