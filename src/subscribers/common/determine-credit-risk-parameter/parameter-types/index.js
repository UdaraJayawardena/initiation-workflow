module.exports = (index, parameterType) => {
  try{
    return require(`./_${index}_${parameterType}`);
  }catch(error){
    return null;
  }
};