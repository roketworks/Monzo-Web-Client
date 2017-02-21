'use strict'; 

import models from '../models/index';

class CategoryService {
  getAll() {
    return new Promise((resolve, reject) => {
      models.Category.findAll().then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }
}

export default CategoryService;