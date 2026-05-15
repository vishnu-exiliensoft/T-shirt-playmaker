import axiosInstance from "./axiosInstance";

export const fetchFabricsData = async () => {
  try {
    const response = await axiosInstance.get(`/api/fabrics`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const fetchCollarsData = async () => {
  try {
    const response = await axiosInstance.get(`/api/collars`);
    // yahi pe filter
    const filteredCollars = response.data.filter(
      (collar) => collar.collar_for === "Tshirt"
    );
    return { ...response, data: filteredCollars };
  } catch (error) {
    throw error;
  }
};
export const fetchButtonsData = async () => {
  try {
    const response = await axiosInstance.get(`/api/buttons`);
    return response;
  } catch (error) {
    throw error;
  }
};
