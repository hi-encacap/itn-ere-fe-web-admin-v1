const TomSelect = require("tom-select");
const axios = require("axios");

const config = require("../configs/configs");

const prepare = require("../utils/prepare");
const Modal = require("../utils/modal");
const EncacapForm = require("../utils/form");

const locationComponents = require("../components/locationManagement");

prepare(async (request) => {
    const addLocationButton = document.getElementById("addNewLocationButton");
    const addLocationModal = new Modal("#addNewLocationModal");

    const GHNInstance = axios.create({
        baseURL: "https://online-gateway.ghn.vn/shiip/public-api/master-data",
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            token: config.GHN_TOKEN,
        },
    });

    const TSCitiesSelect = new TomSelect("#city", {
        maxItems: 1,
        selectOnTab: true,
        maxOptions: 6,
    });
    const TSDistrictsSelect = new TomSelect("#district", {
        maxItems: 1,
        selectOnTab: true,
        maxOptions: 6,
    });
    const TSWardSelect = new TomSelect("#ward", {
        maxItems: 1,
        selectOnTab: true,
        maxOptions: 6,
    });

    let selectedCity = null;
    let selectedDistrict = null;
    let selectedWard = null;

    const cityContainer = document.getElementById("cityContainer");
    const cityLoading = cityContainer.querySelector(".loading");
    const districtContainer = document.getElementById("districtContainer");
    const districtLoading = districtContainer.querySelector(".loading");
    const wardContainer = document.getElementById("wardContainer");
    const wardLoading = wardContainer.querySelector(".loading");

    const renderWards = async (wards) => {
        const wardsListContainer = wardContainer.querySelector("#wardsListContainer");
        wardsListContainer.innerHTML = "";
        const wardsHTML = wards
            .map((ward) => {
                return locationComponents.ward.ward(ward, ward.id === selectedWard);
            })
            .join("");
        wardsListContainer.innerHTML = wardsHTML;
    };

    const getWards = async () => {
        if (!selectedDistrict) return;
        wardLoading.classList.remove("hidden");
        try {
            const { data } = await request.get(`locations/${selectedCity}/${selectedDistrict}/wards`);
            if (data.length === 0) return;
            selectedWard = data[0].id;
            renderWards(data);
            wardLoading.classList.add("hidden");
        } catch (error) {
            console.log(error);
        }
    };

    const renderDistricts = async (districts) => {
        const districtsListContainer = districtContainer.querySelector("#districtsListContainer");
        districtsListContainer.innerHTML = "";
        const districtsHTML = districts
            .map((district) => {
                return locationComponents.district.district(district, district.id === selectedDistrict);
            })
            .join("");
        districtsListContainer.innerHTML = districtsHTML;
        getWards();
    };

    const getDistricts = async () => {
        if (!selectedCity) return;
        districtLoading.classList.remove("hidden");
        try {
            const { data } = await request.get(`locations/${selectedCity}/districts`);
            if (data.length === 0) return;
            selectedDistrict = data[0].id;
            renderDistricts(data);
            districtLoading.classList.add("hidden");
        } catch (error) {
            console.log(error);
        }
    };

    const renderCities = (cities) => {
        const citiesListContainer = cityContainer.querySelector("#cityListContainer");
        citiesListContainer.innerHTML = "";
        const citiesHTML = cities
            .map((city) => {
                return locationComponents.city.city(city, selectedCity === city.id);
            })
            .join("");
        citiesListContainer.innerHTML = citiesHTML;
        getDistricts();
    };

    const getCities = async () => {
        cityLoading.classList.remove("hidden");
        try {
            const { data: cities } = await request.get("locations/cities");
            if (cities.length === 0) {
                cityContainer.innerHTML = locationComponents.city.empty();
                return;
            }
            selectedCity = cities[0].id;
            renderCities(cities);
            cityLoading.classList.add("hidden");
        } catch (error) {
            console.log(error);
        }
    };

    getCities();

    addLocationButton.onclick = async () => {
        const addLocationForm = new EncacapForm("#addNewLocationForm");
        const citySelect = addLocationForm.querySelector(`[name="city"]`);
        const districtSelect = addLocationForm.querySelector(`[name="district"]`);
        const wardSelect = addLocationForm.querySelector(`[name="ward"]`);
        const closeButton = addLocationForm.querySelector(".modal-close");
        const submitButton = addLocationForm.querySelector("[type=submit]");

        addLocationModal.show();
        addLocationForm.disable();
        addLocationForm.hideNotify();

        closeButton.enable();

        TSCitiesSelect.clear();
        TSDistrictsSelect.clear();
        TSWardSelect.clear();

        addLocationForm.validate({
            city: [
                {
                    role: "required",
                    message: "Tên tỉnh, thành phố không được phép để trống",
                },
            ],
            district: [
                {
                    role: "required",
                    message: "Tên quận, huyện không được phép để trống",
                },
            ],
            ward: [
                {
                    role: "required",
                    message: "Tên xã, phường, thị trấn không được phép để trống",
                },
            ],
        });

        citySelect.loading.show();
        GHNInstance.get("province")
            .then((response) => {
                const { data } = response.data;
                citySelect.loading.hide();
                citySelect.enable();
                TSCitiesSelect.addOptions(
                    data.map((city) => ({
                        value: `${city.ProvinceID} - ${city.ProvinceName}`,
                        text: city.ProvinceName,
                    }))
                );
            })
            .catch((error) => {
                addLocationForm.showError("Đã xảy ra lỗi khi tải dữ liệu tỉnh, thành phố.", error);
            });

        citySelect.onchange = async () => {
            let cityId = citySelect.value;
            if (!cityId) {
                return;
            }
            [cityId] = cityId.split(" - ");
            TSDistrictsSelect.clear();
            TSDistrictsSelect.clearOptions();
            districtSelect.disable();
            districtSelect.loading.show();
            try {
                const { data } = await GHNInstance.post("district", {
                    province_id: Number(cityId),
                });
                TSDistrictsSelect.addOptions(
                    data.data.map((district) => ({
                        value: `${district.DistrictID} - ${district.DistrictName}`,
                        text: district.DistrictName,
                    }))
                );
                districtSelect.loading.hide();
                districtSelect.enable();
            } catch (error) {
                addLocationForm.showError("Đã xảy ra lỗi khi tải dữ liệu quận, huyện.", error);
            }
        };

        districtSelect.onchange = async () => {
            let districtId = districtSelect.value;
            if (!districtId) {
                return;
            }
            [districtId] = districtId.split(" - ");
            TSWardSelect.clear();
            TSWardSelect.clearOptions();
            wardSelect.disable();
            wardSelect.loading.show();
            try {
                const { data } = await GHNInstance.post("ward", {
                    district_id: Number(districtId),
                });
                if (!data.data) {
                    addLocationForm.showError("Đã xảy ra lỗi khi tải dữ liệu xã, phường, thị trấn.");
                    return;
                }
                TSWardSelect.addOptions(
                    data.data.map((ward) => ({ value: `${ward.WardCode} - ${ward.WardName}`, text: ward.WardName }))
                );
                wardSelect.loading.hide();
                wardSelect.enable();
            } catch (error) {
                addLocationForm.showError("Đã xảy ra lỗi khi tải dữ liệu xã, phường, thị trấn.", error);
            }
        };

        wardSelect.onchange = async () => {
            const wardId = wardSelect.value;
            if (!wardId) {
                submitButton.disable();
                return;
            }
            submitButton.enable();
        };

        addLocationForm.onsubmit = async () => {
            const [cityId, cityName] = citySelect.value.split(" - ");
            const [districtId, districtName] = districtSelect.value.split(" - ");
            const [wardId, wardName] = wardSelect.value.split(" - ");
            try {
                submitButton.loading.show();
                await request.post("locations", {
                    city: {
                        id: Number(cityId),
                        name: cityName,
                    },
                    district: {
                        id: Number(districtId),
                        name: districtName,
                    },
                    ward: {
                        id: Number(wardId),
                        name: wardName,
                    },
                });
                addLocationForm.showSuccess("Thành công. Đã thêm địa điểm mới.");
                submitButton.loading.hide();
                addLocationForm.enable();
            } catch (error) {
                addLocationForm.showError("Đã xảy ra lỗi khi thêm khu vực mới.", error);
            }
        };
    };
});
