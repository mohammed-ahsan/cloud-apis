const Category = require("../models/Category");
const Product = require("../models/Product");
const SubCategory = require("../models/SubCategory");

const addCategory = async (req, res) => {
  try {
    console.log("addCategory");
    const newCategory = new Category(req.body);
    await newCategory.save();
    res.status(200).send({
      message: "Category Added Successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// all multiple category
const addAllCategory = async (req, res) => {
  // console.log("category", req.body);
  try {
    await Category.deleteMany();

    await Category.insertMany(req.body);

    res.status(200).send({
      message: "Category Added Successfully!",
    });
  } catch (err) {
    console.log(err.message);

    res.status(500).send({
      message: err.message,
    });
  }
};

// get status show category
const getShowingCategory = async (req, res) => {
  try {
    const categories = await Category.find({
      status: "show",
      // catalog: "show",
    }).sort({
      _id: -1,
    });

    // console.log("getShowingCategory");

    const categoryList = readyToParentAndChildrenCategory(categories);
    // console.log("category list", categoryList.length);
    res.send(categoryList);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};
const getAncestors = async (categoryId, ancestors = []) => {
  const category = await Category.findById(categoryId);

  // console.log("category", category);

  if (category?.id !== "Root") {
    ancestors.unshift({ _id: category._id, name: category.name });
    if (category.parentId) {
      return getAncestors(category.parentId, ancestors);
    }
  }

  return ancestors;
};

// get catalog category
const getShowingCatalogCategory = async (req, res) => {
  try {
    const categories = await Category.find({
      status: "show",
      catalog: "show",
    }).sort({
      _id: -1,
    });

    // console.log("categories", categories);

    // const categoryList = readyToParentAndChildrenCategory(categories);
    // console.log("getShowingCatalogCategory", categoryList.length);
    res.send(categories);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getShowingCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.query;
    // console.log("getShowingCategoryBySlug", slug);

    const category = await Category.findOne({
      status: "show",
      slug: slug,
    }).sort({
      _id: -1,
    });
    const ancestors = await getAncestors(category.parentId || null);
    const categoryList = [
      ...ancestors,
      { _id: category._id, name: category.name },
    ];

    let products = [];

    if (categoryList?.length === 3) {
      // console.log("now need to find products");
      products = await Product.find({
        category: category._id,
      }).sort({
        _id: -1,
      });
    }

    const childCategories = await Category.find({ parentId: category._id });
    // const categoryList = readyToParentAndChildrenCategory(childCategories);
    // console.log("category list", categoryList.length);
    return res.send({
      category,
      products,
      childCategories,
      categoryList,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// get all category parent and child
const getAllCategory = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ _id: -1 });

    const categoryList = readyToParentAndChildrenCategory(categories);
    //  console.log('categoryList',categoryList)
    res.send(categoryList);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ _id: -1 });

    res.send(categories);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    res.send(category);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// category update
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    console.log("slug", req.body.slug);
    if (category) {
      category.name = { ...category.name, ...req.body.name };
      category.description = {
        ...category.description,
        ...req.body.description,
      };
      category.slug = req.body.slug;
      category.icon = req.body.icon;
      category.status = req.body.status;
      category.catalog = req.body.catalog;
      category.parentId = req.body.parentId
        ? req.body.parentId
        : category.parentId;
      category.parentName = req.body.parentName;

      await category.save();
      res.send({ message: "Category Updated Successfully!" });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// udpate many category
const updateManyCategory = async (req, res) => {
  try {
    const updatedData = {};
    for (const key of Object.keys(req.body)) {
      if (
        req.body[key] !== "[]" &&
        Object.entries(req.body[key]).length > 0 &&
        req.body[key] !== req.body.ids
      ) {
        updatedData[key] = req.body[key];
      }
    }

    await Category.updateMany(
      { _id: { $in: req.body.ids } },
      {
        $set: updatedData,
      },
      {
        multi: true,
      }
    );

    res.send({
      message: "Categories update successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// category update status
const updateStatus = async (req, res) => {
  // console.log('update status')
  try {
    const newStatus = req.body.status;

    await Category.updateOne(
      { _id: req.params.id },
      {
        $set: {
          status: newStatus,
        },
      }
    );
    res.status(200).send({
      message: `Category ${
        newStatus === "show" ? "Published" : "Un-Published"
      } Successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};
//single category delete
const deleteCategory = async (req, res) => {
  try {
    console.log("id cat >>", req.params.id);
    await Category.deleteOne({ _id: req.params.id });
    await Category.deleteMany({ parentId: req.params.id });
    res.status(200).send({
      message: "Category Deleted Successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }

  //This is for delete children category
  // Category.updateOne(
  //   { _id: req.params.id },
  //   {
  //     $pull: { children: req.body.title },
  //   },
  //   (err) => {
  //     if (err) {
  //       res.status(500).send({ message: err.message });
  //     } else {
  //       res.status(200).send({
  //         message: 'Category Deleted Successfully!',
  //       });
  //     }
  //   }
  // );
};

// all multiple category delete
const deleteManyCategory = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ _id: -1 });

    await Category.deleteMany({ parentId: req.body.ids });
    await Category.deleteMany({ _id: req.body.ids });

    res.status(200).send({
      message: "Categories Deleted Successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};
const readyToParentAndChildrenCategory = (categories, parentId = null) => {
  const categoryList = [];
  let Categories;
  if (parentId == null) {
    Categories = categories.filter((cat) => cat.parentId == undefined);
  } else {
    Categories = categories.filter((cat) => cat.parentId == parentId);
  }

  for (let cate of Categories) {
    categoryList.push({
      _id: cate._id,
      name: cate.name,
      parentId: cate.parentId,
      parentName: cate.parentName,
      description: cate.description,
      icon: cate.icon,
      status: cate.status,
      catalog: cate.catalog,
      slug: cate.slug,
      children: readyToParentAndChildrenCategory(categories, cate._id),
    });
  }

  return categoryList;
};

const addsubcatagorycontroller = async (req, res) => {
  try {
    const { title, parentName, countryName, parentId, imageurl } = req.body;

    if (!title || !parentName || !countryName || !parentId || !imageurl) {
      res.status(401).json({ messege: "Please Fill All The Feild" });
    } else {
      const createdSubCategory = await SubCategory.create({
        title,
        parentName,
        countryName,
        parentId,
        imageurl,
      });

      const savedSub = await createdSubCategory.save();

      if (savedSub) {
        res.status(200).json({ messege: "Created Successfully" });
      }
    }
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getAllSubCategoriesController = async (req, res) => {
  try {
    // Fetch all subcategories from the database
    const subCategories = await SubCategory.find({});

    // Check if any subcategories were found
    if (subCategories.length === 0) {
      return res.status(404).json({ message: "No subcategories found" });
    }

    // Send the fetched subcategories as a response
    res.status(200).json(subCategories);
  } catch (err) {
    // Handle any errors that occur during the process
    res.status(500).json({ message: err.message });
  }
};

const findSubCategoriesByParentName = async (req, res) => {
  try {
    const { parentName } = req.params;

    // Check if parentName is provided
    if (!parentName) {
      return res.status(400).json({ message: "Parent name is required" });
    }

    // Fetch subcategories with the given parentName
    const subCategories = await Category.find({
      parentId: parentName,
    });

    // Check if any subcategories were found
    if (subCategories.length === 0) {
      return res.json({
        message: "No subcategories found for the provided parent name",
      });
    }

    // Send the fetched subcategories as a response
    res.status(200).json(subCategories);
  } catch (err) {
    // Handle any errors that occur during the process
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  addCategory,
  addAllCategory,
  getAllCategory,
  getShowingCategory,
  getShowingCategoryBySlug,
  getShowingCatalogCategory,
  getCategoryById,
  updateCategory,
  updateStatus,
  deleteCategory,
  deleteManyCategory,
  getAllCategories,
  updateManyCategory,
  addsubcatagorycontroller,
  getAllSubCategoriesController,
  findSubCategoriesByParentName,
};
